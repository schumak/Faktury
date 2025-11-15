from django.db import models


class Countries(models.TextChoices):
    CZECHIA = 'CZECHIA', 'Czechia'
    SLOVAKIA = 'SLOVAKIA', 'Slovakia'


class Person(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    identificationNumber = models.CharField(max_length=50, db_index=True)
    taxNumber = models.CharField(max_length=50, blank=True, null=True)
    accountNumber = models.CharField(max_length=50)
    bankCode = models.CharField(max_length=20)
    iban = models.CharField(max_length=34, blank=True, null=True)
    telephone = models.CharField(max_length=20)
    mail = models.EmailField()
    street = models.CharField(max_length=100)
    zip = models.CharField(max_length=10)
    city = models.CharField(max_length=50)
    country = models.CharField(
        max_length=10,
        choices=Countries.choices,
        default=Countries.CZECHIA
    )
    note = models.TextField(blank=True, null=True)
    hidden = models.BooleanField(default=False, db_index=True)


class Invoice(models.Model):
    invoice_number = models.CharField(max_length=100, db_index=True)
    seller = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='invoices_seller')
    buyer = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='invoices_buyer')
    issued = models.DateField()
    due_date = models.DateField()
    product = models.CharField(max_length=200)
    price = models.FloatField()
    vat = models.FloatField()
    note = models.TextField(blank=True, null=True)
    hidden = models.BooleanField(default=False, db_index=True)
    archived = models.BooleanField(default=False)

    def __str__(self):
        
        return f"{self.invoice_number} - {self.seller.name} to {self.buyer.name}"