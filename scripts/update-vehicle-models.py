"""Refresh the bundled NHTSA vPIC car/SUV/truck model catalog (no API key).
Documentation: https://vpic.nhtsa.dot.gov/api/
Model names are suggestions, not evidence of current listings or trim availability.
"""
import datetime, json, pathlib, urllib.request
root = pathlib.Path(__file__).resolve().parents[1]
base = 'https://vpic.nhtsa.dot.gov/api/vehicles/'
paths = ['GetMakesForVehicleType/car', 'GetMakesForVehicleType/truck',
         'GetMakesForVehicleType/multipurpose', 'GetModelsForMake/*']
responses = []
for path in paths:
    with urllib.request.urlopen(base + path + '?format=json', timeout=60) as response:
        data = json.load(response)
    rows = data.get('Results')
    if not isinstance(rows, list) or not rows:
        raise RuntimeError('No catalog records returned for ' + path)
    responses.append(rows)
    print(path + ': ' + str(len(rows)) + ' records', flush=True)
make_ids = {str(row['MakeId']) for rows in responses[:3] for row in rows}
catalog = {}
for row in responses[3]:
    if str(row.get('Make_ID')) not in make_ids:
        continue
    make, model = row.get('Make_Name', '').strip(), row.get('Model_Name', '').strip()
    if not make or not model or len(make) > 40 or len(model) > 60:
        continue
    if model.lower() in {'unknown', 'other', 'not applicable'}:
        continue
    catalog.setdefault(make, set()).add(model)
if len(catalog) < 100 or not any(make.upper() == 'AUDI' for make in catalog):
    raise RuntimeError('Catalog unexpectedly incomplete; preserving previous snapshot')
# These manufacturers also build motorcycles; keep the car/SUV/truck models only.
for mixed_make in ['BMW', 'Honda', 'Suzuki']:
    road_models = set()
    for vehicle_type in ['car', 'truck', 'multipurpose']:
        path = f'GetModelsForMakeYear/make/{mixed_make}/vehicletype/{vehicle_type}?format=json'
        with urllib.request.urlopen(base + path, timeout=60) as response:
            rows = json.load(response).get('Results')
        if not isinstance(rows, list):
            raise RuntimeError('Invalid vehicle-type catalog for ' + mixed_make)
        road_models.update(row['Model_Name'].strip() for row in rows if row.get('Model_Name'))
    existing_make = next((make for make in catalog if make.casefold() == mixed_make.casefold()), mixed_make)
    if not road_models:
        raise RuntimeError('No road models for ' + mixed_make)
    catalog[existing_make] = road_models
    print(mixed_make + ': ' + str(len(road_models)) + ' car/SUV/truck models', flush=True)
output = {'source': 'NHTSA vPIC', 'sourceUrl': 'https://vpic.nhtsa.dot.gov/api/',
          'updatedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'scope': 'Models in vPIC for car, truck and multipurpose vehicle makes; not all global/historical models or trims.',
          'models': {make: sorted(models) for make, models in sorted(catalog.items())}}
(root / 'lib' / 'vehicle-models.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'Bundled {len(catalog)} makes and {sum(map(len, catalog.values()))} make/model pairs')
