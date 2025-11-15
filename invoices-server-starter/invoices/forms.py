from django import forms
from .models import Invoice

class InvoiceForm(forms.ModelForm):
    class Meta:
        model = Invoice
        fields = [
            'invoice_number',
            'seller',
            'buyer',
            'issued',
            'due_date',
            'product',
            'price',
            'vat',
            'note',
        ]