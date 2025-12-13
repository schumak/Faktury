from django.db import models
from django.utils import timezone

# Datové modely pro osoby (Person) a faktury (Invoice).
# Obsahují všechna pole ukládaná v databázi a logiku generování čísla faktury.

# Výčtové hodnoty pro pole country u osoby
class Countries(models.TextChoices):
    CZECHIA = "CZECHIA", "Czechia"
    SLOVAKIA = "SLOVAKIA", "Slovakia"


# Model osoby – reprezentuje dodavatele nebo odběratele faktur.
# hidden=True znamená „soft delete“, osoba se nezobrazuje, ale zůstává v DB.
class Person(models.Model):
    # Základní identifikační údaje
    name = models.CharField(max_length=100, db_index=True)
    identificationNumber = models.CharField(max_length=50, db_index=True)
    taxNumber = models.CharField(max_length=50, blank=True, null=True)

    # Bankovní údaje
    accountNumber = models.CharField(max_length=50)
    bankCode = models.CharField(max_length=20)
    iban = models.CharField(max_length=34, blank=True, null=True)

    # Kontaktní údaje
    telephone = models.CharField(max_length=20)
    mail = models.EmailField()

    # Adresa
    street = models.CharField(max_length=100)
    zip = models.CharField(max_length=10)
    city = models.CharField(max_length=50)
    country = models.CharField(
        max_length=10,
        choices=Countries.choices,
        default=Countries.CZECHIA,
    )

    # Interní poznámka
    note = models.TextField(blank=True, null=True)

    # Soft delete příznak (osoba se skryje místo fyzického smazání)
    hidden = models.BooleanField(default=False, db_index=True)


# Model faktury – obsahuje položky faktury, vazby na osoby a logiku generování čísla.
class Invoice(models.Model):
    invoice_number = models.CharField(max_length=100, db_index=True)

    # Vazby na osoby (dodavatel a odběratel)
    seller = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name="invoices_seller",
    )
    buyer = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name="invoices_buyer",
    )

    # Datum vystavení a splatnosti
    issued = models.DateField()
    due_date = models.DateField()

    # Informace o produktu / službě
    product = models.CharField(max_length=200)
    price = models.FloatField()
    vat = models.FloatField()
    note = models.TextField(blank=True, null=True)

    # Interní příznaky – hidden (soft delete), archived (archivace)
    hidden = models.BooleanField(default=False, db_index=True)
    archived = models.BooleanField(default=False)

    # Automatické generování čísla faktury při vytvoření nové faktury.
    # Formát: RRRRxxxxxxx (rok + pořadové číslo).
    def save(self, *args, **kwargs):
        from django.utils import timezone

        # jen při vytváření nové faktury (invoice_number prázdné)
        if not self.invoice_number:
            year = timezone.now().year
            prefix = f"{year}"

            # poslední faktura toho roku
            last = (
                Invoice.objects.filter(invoice_number__startswith=prefix)
                .order_by("-invoice_number")
                .first()
            )

            if last:
                # část za rokem převedeme na číslo a +1
                last_num = int(last.invoice_number[len(prefix) :])
                new_num = last_num + 1
            else:
                new_num = 1

            # výsledný tvar např. 2025000001
            self.invoice_number = f"{prefix}{new_num:07d}"

        super().save(*args, **kwargs)

    # Textová reprezentace faktury pro admin / debug
    def __str__(self):
        return f"{self.invoice_number} - {self.seller.name} to {self.buyer.name}"