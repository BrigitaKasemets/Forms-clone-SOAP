# Forms-clone-SOAP

## Ülevaade
See projekt loob SOAP versiooni olemasolevast Forms-clone REST API-st. Eesmärk on pakkuda samasugust funktsionaalsust kasutades SOAP protokolli, mis võimaldab olemasoleva Forms rakenduse funktsionaalsust kasutada ka SOAP-põhistes süsteemides.

## Funktsionaalsus
Nii REST kui ka SOAP API pakuvad identset funktsionaalsust, sealhulgas:

- **Kasutajate haldus** (loomine, lugemine, uuendamine, kustutamine)
- **Autentimine** (sisselogimine, väljalogimine)
- **Vormide haldus** (loomine, vaatamine, muutmine, kustutamine)
- **Küsimuste haldus** (lisamine, muutmine, kustutamine)
- **Vastuste haldus** (esitamine, vaatamine)

## Projekti Struktuur
```
├── wsdl/                    # WSDL ja XSD failid teenuse kirjeldamiseks
│   ├── formsClone.wsdl      # SOAP teenuse definitsioon
│   └── schema/
│       └── formsClone.xsd   # XML Schema andmetüüpide jaoks
├── src/                     # SOAP teenuse lähtekood
│   ├── server.js            # SOAP serveri käivitamine
│   ├── config/              # Keskkonna seadistused
│   ├── db/                  # Andmebaasi ühendus ja initsialiseerimine
│   ├── middleware/          # Autentimise middleware
│   ├── models/              # Andmemudelid
│   ├── services/            # SOAP teenuste loogika
│   └── utils/               # XML töötluse abifunktsioonid
├── client/
│   └── example/
│       └── client.js        # SOAP kliendi näidis
├── tests/                   # Automaattestid
│   ├── compare_apis.js      # SOAP vs REST võrdlustest
│   ├── run_tests.sh         # Testimise skript
│   └── results/             # Testide tulemused
├── scripts/
│   └── run.sh               # Mõlema serveri käivitusskript
├── forms-clone-api/         # Originaalne REST API
└── data/                    # Andmebaasifailid
```

## Eeldused
- Node.js (v14 või uuem)
- npm (v6 või uuem)

## Paigaldamine
1. Klooni repositoorium:
```fish
git clone <repositooriumi-url>
cd Forms-clone-SOAP
```

2. Paigalda sõltuvused:
```fish
npm install
```

3. Seadista keskkonna muutujad (valikuline):
```fish
cp src/config/.env.example src/config/.env
# Muuda .env faili vastavalt vajadusele
```

## Käivitamine

1. **WSDL ja XSD Definitsioonid**: REST API põhjal luuakse WSDL ja XSD failid, mis kirjeldavad teenuse funktsionaalsust ja andmestruktuure.

2. **SOAP Teenused**: Implementeeritakse SOAP protokollil põhinevad teenused, mis pakuvad samu võimalusi kui REST API:
   - Kasutajate haldus (registreerimine, autentimine)
   - Vormide loomine ja haldamine
   ## Käivitamine
### Teenuste käivitamine
Lihtsaim viis nii REST kui ka SOAP teenuste käivitamiseks:

```fish
cd scripts
./run.sh
```

See skript:
- Kontrollib vajalikke keskkonna komponente (Node.js, npm)
- Loob .env failid mõlema teenuse jaoks (kui need puuduvad) koos automaatselt genereeritud JWT salajaste võtmetega
- Paigaldab vajalikud sõltuvused mõlema teenuse jaoks
- Käivitab andmebaasi initsialiseerimise (kui vajalik)
- Käivitab nii REST kui ka SOAP teenused samaaegselt

**Teenused on kättesaadavad:**
- REST API: http://localhost:3000/api/
- SOAP lõpp-punkt: http://localhost:3001/soap/formsclone
- WSDL: http://localhost:3001/soap/formsclone?wsdl

### SOAP kliendi kasutamine
Näidisklient demonstreerib kõiki SOAP operatsioone:

```fish
node client/example/client.js
```

**Demonstreerib:**
- Kasutaja loomist, sisselogimist ja tokeni saamist
- Kõiki CRUD operatsioone kasutajate, vormide, küsimuste ja vastuste jaoks

## Testimine

Projekt sisaldab põhjalikku testimise süsteemi, mis kontrollib SOAP ja REST API-de vastavust ja funktsionaalsust.

### Enne testimist
Veendu, et mõlemad serverid töötavad:

1. **SOAP server** (port 3001):
```fish
node src/server.js
```

2. **REST server** (port 3000):
```fish
cd forms-clone-api
node src/formsClone.js
```

Või kasuta ühtset käivitusskripti:
```fish
cd scripts; and ./run.sh
```

### Testimise võimalused

#### 1. Automaatne API võrdlustest
Kõige põhjalikum test, mis võrdleb SOAP ja REST API-de vastavust:

```fish
node tests/compare_apis.js
```

**Mida see test teeb:**
- Testib 8 peamist operatsiooni (kasutajad, vormid, küsimused, vastused)
- Võrdleb SOAP XML ja REST JSON vastuseid
- Kontrollib andmete järjepidevust mõlemas API-s
- Loob detailse logi faili `tests/results/` kausta

#### 2. Täielik testimise skript
Automaatne sõltuvuste paigaldamine ja testide käivitamine:

```fish
cd tests
chmod +x run_tests.sh
./run_tests.sh
```

**Skript teeb:**
- Paigaldab vajalikud npm paketid
- Käivitab API võrdlustesti
- Salvestab tulemused timestampiga

#### 3. SOAP kliendi demonstratsioon
Sammhaaval demonstratsioon kõikidest SOAP operatsioonidest:

```fish
node client/example/client.js
```

**Demonstreerib:**
- 22 erinevat SOAP operatsiooni
- Täielik CRUD tsükkel (Create, Read, Update, Delete)
- Autentimise ja sessiooni haldus
- Vormide, küsimuste ja vastuste töötlus

### Testide tulemused

#### Logifailid
Kõik testide tulemused salvestatakse:
```
tests/results/comparison_YYYY-MM-DD_HHMM.log
```

#### Võrdluse näited
Test kontrollib:

**Kasutaja loomine:**
- SOAP: XML formaat koos `<success>true</success>`
- REST: JSON formaat koos kasutaja andmetega
- ✅ Mõlemad loovad kasutaja edukalt

**Vormide haldus:**
- SOAP: Vormide loomine/lugemine XML formaadis
- REST: Vormide loomine/lugemine JSON formaadis
- ✅ Identne funktsionaalsus

**Autentimine:**
- SOAP: JWT token XML `<token>` elemendis
- REST: JWT token JSON `token` väljas
- ✅ Samad JWT tokenid, ühilduvad

### Mida testid kontrollivad
- **API Vastavus:** SOAP ja REST pakuvad identset funktsionaalsust
- **Andmete Terviklus:** Mõlemad API-d kasutavad sama andmebaasi korrektselt
- **Autentimine:** JWT süsteem toimib mõlemas protokollis
- **CRUD Operatsioonid:** Loomine, lugemine, uuendamine, kustutamine töötab
- **Vastuste Formaat:** XML ja JSON annavad ekvivalentseid tulemusi
- **Veakäsitlus:** Mõlemad API-d käsitlevad vigu järjepidevalt

### Testimise järjekord
Soovitatav testimise järjekord:

1. **Kõigepealt** - API võrdlustest:
```fish
node tests/compare_apis.js
```

2. **Seejärel** - SOAP kliendi demonstratsioon:
```fish
node client/example/client.js
```

3. **Valikuliselt** - täielik skript koos sõltuvuste paigaldamisega:
```fish
./tests/run_tests.sh
```

### Probleemide lahendamine

**Kui serverid ei tööta:**
```fish
# Kontrolli portide kättesaadavust
lsof -i :3000  # REST server
lsof -i :3001  # SOAP server

# Käivita serverid uuesti
cd scripts; and ./run.sh
```

**Kui testid ebaõnnestuvad:**
1. Kontrolli, et mõlemad serverid töötavad
2. Vaata logi faile `tests/results/` kaustas
3. Kontrolli andmebaasi õigusi (`data/forms.db`, `forms-clone-api/forms.db`)

**Testimise keskkond:**
- Node.js v14+ on vajalik
- Mõlemad andmebaasid (SQLite) peavad olema kirjutatavad
- Pordid 3000 ja 3001 peavad olema vabad

## API dokumentatsioon
SOAP API dokumentatsioon on saadaval WSDL failina: `wsdl/formsClone.wsdl`

### WSDL üksikasjad
WSDL fail (`wsdl/formsClone.wsdl`) defineerib:
- Kõik andmetüübid kasutades XML Schema-t
- Operatsioonid, mis vastavad REST API endpointidele
- SOAP sidumine kõikide operatsioonide jaoks
- Teenuse lõpp-punkti üksikasjad

## Vigade käsitlemine
SOAP API kasutab standardseid SOAP Fault sõnumeid veaolukordade jaoks, sealhulgas:
- Kliendi vead (400-taseme HTTP ekvivalendid)
- Serveri vead (500-taseme HTTP ekvivalendid)
- Autentimise/autoriseerimise tõrked

