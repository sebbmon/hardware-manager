from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Hardware, Rental

User = get_user_model()

class HardwareTests(APITestCase):
    def setUp(self):
        # creating a normal user for tests
        self.user = User.objects.create_user(email='testuser@example.com', password='testpassword123')
        # creating an admin user
        self.admin_user = User.objects.create_superuser(email='admin@example.com', password='adminpassword123')
        
    def test_rent_hardware_in_repair(self):
        """1. Attempt to rent damaged equipment"""
        self.client.force_authenticate(user=self.user)
        hardware = Hardware.objects.create(
            name="Broken Laptop",
            brand="Dell",
            status="Repair",
            category="laptop",
            serial_number="SN-BROKEN-123"
        )
        # constructing the URL to the @action rent in HardwareViewSet
        url = reverse('hardware-rent', kwargs={'pk': hardware.pk})
        response = self.client.post(url)
        
        # checking if the application returns an error 400 and the appropriate message
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], 'Equipment is not available for rent.')

    def test_double_rent_same_hardware(self):
        """2. Double rent of the same equipment (Race Condition / Availability Check)"""
        self.client.force_authenticate(user=self.user)
        hardware = Hardware.objects.create(
            name="Good Laptop",
            brand="Lenovo",
            status="Available",
            category="laptop",
            serial_number="SN-GOOD-456"
        )
        url = reverse('hardware-rent', kwargs={'pk': hardware.pk})
        
        # first rent (success)
        response1 = self.client.post(url)
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # second rent attempt of the same equipment - status changed during the first POST
        response2 = self.client.post(url)
        
        # according to our logic, we expect an error
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response2.data['detail'], 'Equipment is not available for rent.')

    def test_return_hardware_success(self):
        """3. Correct return of equipment and update of its status"""
        self.client.force_authenticate(user=self.user)
        hardware = Hardware.objects.create(
            name="MacBook Pro",
            brand="Apple",
            status="Available",
            category="laptop",
            serial_number="MBA-789"
        )
        rent_url = reverse('hardware-rent', kwargs={'pk': hardware.pk})
        return_url = reverse('hardware-return-hardware', kwargs={'pk': hardware.pk})
        
        # renting equipment before returning
        self.client.post(rent_url)
        
        # checking if the status has changed correctly after renting
        hardware.refresh_from_db()
        self.assertEqual(hardware.status, 'In Use')
        self.assertEqual(Rental.objects.filter(hardware=hardware, user=self.user, is_active=True).count(), 1)
        
        # returning the equipment
        response = self.client.post(return_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        hardware.refresh_from_db()
        
        # verification of data correctness on the Hardware model side - it is 'Available' again
        self.assertEqual(hardware.status, 'Available')
        
        # verification on the Rental model side - the rental is closed
        rental = Rental.objects.get(hardware=hardware, user=self.user)
        self.assertFalse(rental.is_active)
        self.assertIsNotNone(rental.returned_at)

    def test_regular_user_cannot_access_admin_functions(self):
        """4. Regular user cannot access admin functions"""
        self.client.force_authenticate(user=self.user)
        hardware = Hardware.objects.create(
            name="Admin Monitor",
            brand="LG",
            status="Available",
            category="monitor",
            serial_number="LGM-000"
        )
        
        # Attempt to GET - list in the administrator section
        admin_hardware_list_url = reverse('admin-hardware-list')
        response_list = self.client.get(admin_hardware_list_url)
        
        # No access with 403 Forbidden message
        self.assertEqual(response_list.status_code, status.HTTP_403_FORBIDDEN)
        
        # Attempt to perform an administrative action e.g. mark as Repair
        admin_mark_repair_url = reverse('admin-hardware-mark-in-repair', kwargs={'pk': hardware.pk})
        response_repair = self.client.post(admin_mark_repair_url)
        
        # No operation started - access was also blocked (403 Forbidden)
        self.assertEqual(response_repair.status_code, status.HTTP_403_FORBIDDEN)
