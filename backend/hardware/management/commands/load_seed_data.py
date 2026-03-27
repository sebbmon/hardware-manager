import json
from datetime import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from hardware.models import Hardware, Rental

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

        with transaction.atomic():
            for item in data:
                # 1. Ignore ID from JSON (auto-increment will be used by default)
                
                # 2. Parse purchaseDate
                purchase_date_str = item.get('purchaseDate')
                purchase_date = None
                if purchase_date_str:
                    # Supported formats: YYYY-MM-DD, DD-MM-YYYY
                    for fmt in ('%Y-%m-%d', '%d-%m-%Y'):
                        try:
                            purchase_date = datetime.strptime(purchase_date_str, fmt).date()
                            break
                        except ValueError:
                            pass
                
                # 3. Sanitize Data
                brand = item.get('brand')
                if not brand:  # Handles None or empty string ""
                    brand = 'Unknown'
                elif brand == 'Appel':
                    brand = 'Apple'
                
                status = item.get('status', 'Available')
                # Severe errors (e.g. status "Unknown") - fallback to 'Repair'
                if status not in valid_statuses:
                    status = 'Repair'
                
                # 4. Notes / History
                notes = item.get('notes', '').strip()
                history = item.get('history', '').strip()
                
                combined_notes_parts = []
                if notes:
                    combined_notes_parts.append(f"Notes: {notes}")
                if history:
                    combined_notes_parts.append(f"History: {history}")
                
                final_notes = "\n".join(combined_notes_parts) if combined_notes_parts else None
                
                # 5. assignedTo logic
                assigned_to = item.get('assignedTo')
                if assigned_to:
                    status = 'In Use'  # Force status to "In Use"
                    
                # Create Hardware record
                name = item.get('name', 'Unknown Device')
                hardware = Hardware.objects.create(
                    name=name,
                    brand=brand,
                    purchase_date=purchase_date,
                    status=status,
                    notes=final_notes
                )
                created_count += 1
                
                # Create User and Rental if assignedTo is present
                if assigned_to:
                    user, created = User.objects.get_or_create(
                        email=assigned_to,
                        defaults={'username': assigned_to}
                    )
                    
                    Rental.objects.create(
                        user=user,
                        hardware=hardware,
                        is_active=True
                    )
                    
        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {created_count} hardware items.'))
