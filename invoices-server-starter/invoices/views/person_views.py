from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum

from ..serializers import PersonSerializer
from ..models import Person, Invoice


class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.filter(hidden=False)
    serializer_class = PersonSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance.hidden = True
        instance.save(update_fields=["hidden"])

        validated_data = serializer.validated_data
        validated_data.pop("hidden", None)
        new_instance = Person.objects.create(**validated_data, hidden=False)

        output_serializer = self.get_serializer(new_instance)
        return Response(output_serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.hidden = True
        instance.save(update_fields=["hidden"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class PersonStatisticsView(APIView):
    """
    GET /api/persons/statistics
    Volitelný query param ?include_hidden=true zobrazí i "smazané" (hidden) osoby.
    Bez parametru se počítají jen nesmazané (hidden=False).
    """

    def get(self, request):
        include_hidden = request.query_params.get("include_hidden") == "true"

        persons_qs = Person.objects.all()
        if not include_hidden:
            persons_qs = persons_qs.filter(hidden=False)

        results = []
        for p in persons_qs:
            revenue = (
                Invoice.objects.filter(seller=p).aggregate(total=Sum("price"))["total"]
                or 0
            )
            results.append(
                {
                    "personId": p.id,
                    "personName": p.name,
                    "revenue": revenue,
                }
            )

        return Response(results)