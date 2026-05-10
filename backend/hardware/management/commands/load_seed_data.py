import json
from datetime import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from hardware.models import Hardware, Rental 
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Loads and cleans hardware seed data from a JSON file'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to the JSON file to load')

    def handle(self, *args, **kwargs):
        json_file_path = kwargs['json_file']

        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading JSON file: {e}"))
            return

        valid_statuses = [choice[0] for choice in Hardware.STATUS_CHOICES]
        created_count = 0
        
        # Memory set to track IDs and avoid Duplicate ID trap (IntegrityError)
        seen_ids = set()

        with transaction.atomic():
            for item in data:
                item_id = item.get('id')
                
                # 1. DUPLICATE ID TRAP PROTECTION
                if item_id in seen_ids:
                    self.stdout.write(self.style.WARNING(f"Skipped duplicate ID ({item_id}) for '{item.get('name', 'Unknown')}'. Avoiding database crash."))
                    continue
                if item_id is not None:
                    seen_ids.add(item_id)

                raw_brand = item.get('brand', '').strip()
                raw_status = item.get('status')

                # 2. DEGENERATED RECORD PROTECTION (Garbage in, garbage out)
                # If there's no brand and the status is complete nonsense, drop the record.
                if not raw_brand and raw_status not in valid_statuses:
                    self.stdout.write(self.style.WARNING(f"Skipped completely degenerated record (ID: {item_id}). Insufficient data."))
                    continue

                # 3. Parsing purchase date (handles both YYYY-MM-DD and DD-MM-YYYY)
                purchase_date_str = item.get('purchaseDate')
                purchase_date = None
                if purchase_date_str:
                    for fmt in ('%Y-%m-%d', '%d-%m-%Y'):
                        try:
                            purchase_date = datetime.strptime(purchase_date_str, fmt).date()
                            break
                        except ValueError:
                            pass
                
                # 4. Notes & History (Merge into a single notes field)
                notes = item.get('notes', '').strip()
                history = item.get('history', '').strip()
                
                combined_notes_parts = []
                if notes:
                    combined_notes_parts.append(f"Notes: {notes}")
                if history:
                    combined_notes_parts.append(f"History: {history}")
                
                final_notes = "\n".join(combined_notes_parts) if combined_notes_parts else None

                # 5. Data sanitization and brand normalization
                brand = raw_brand
                if not brand:  
                    brand = 'Unknown'
                elif brand == 'Appel':
                    brand = 'Apple'
                    
                name = item.get('name', 'Unknown Device').strip()

                # 6. NORMALIZATION: Remove brand from the beginning of the name
                # e.g., "Apple iPhone 13" -> "iPhone 13"
                if brand != 'Unknown' and name.lower().startswith(brand.lower()):
                    # Slice the name string to remove the brand and strip leading spaces
                    name = name[len(brand):].strip()
                
                status = raw_status if raw_status in valid_statuses else 'Available'
                
                # A. Protection against completely wrong statuses (e.g., 'Unknown')
                if raw_status not in valid_statuses:
                    status = 'Repair'

                # B. KEYWORD SCANNER (Forcing Repair status despite JSON)
                if final_notes and status == 'Available':
                    # List of "red flags" indicating damage
                    red_flags = ['damage', 'swelling', 'service', 'sticky', 'broken', 'issue', 'liquid']
                    notes_lower = final_notes.lower()
                    
                    if any(flag in notes_lower for flag in red_flags):
                        status = 'Repair'
                
                # 7. assignedTo logic & ORPHANED "IN USE" PROTECTION
                assigned_to = item.get('assignedTo')
                
                if assigned_to:
                    status = 'In Use'
                elif status == 'In Use':
                    status = 'Available'
                    
                    alert_msg = "SYSTEM WARNING: Hardware was marked as 'In Use' in source data, but no user was assigned. Status forcefully reset to 'Available'."
                    final_notes = f"{final_notes}\n\n{alert_msg}" if final_notes else alert_msg
                    
                    self.stdout.write(self.style.WARNING(f"Fixed orphaned 'In Use' status for '{name}' (ID: {item_id}). Resetting to Available."))
                    
                # 8. Creating Hardware record (Enforcing original JSON ID)
                hardware = Hardware.objects.create(
                    #id=item_id,
                    name=name,
                    brand=brand,
                    purchase_date=purchase_date,
                    status=status,
                    notes=final_notes
                )
                created_count += 1
                
                # 9. Creating User and active rental if hardware is assigned
                if assigned_to:
                    user, created = User.objects.get_or_create(
                        email=assigned_to
                    )
                    
                    # If user didn't exist, we set a default secure password
                    if created:
                        default_password = os.getenv('SEED_USER_PASSWORD')
                        user.set_password(default_password)
                        user.save()
                        self.stdout.write(self.style.SUCCESS(f"Created missing employee: {assigned_to} (Default password from .env file)"))
                    
                    Rental.objects.create(
                        user=user,
                        hardware=hardware,
                        is_active=True
                    )
                    
        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {created_count} hardware items. Data sanitized and relations built!'))