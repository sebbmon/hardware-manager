# The AI Development Log

## Tooling
ChatGPT - Understanding requirements, handling starting point JSON advices, writing text
Gemini 3.1 Pro - Most complex issues, debugging, backend security advices and solutions
Gemini 3.0 Flash - Generating frontend structure, general solution advices
Google Antigravity - Mostly used for frontend styling and fixing the whole system issues as it sees the whole repo

## Data Strategy
I started with checking for issues manually, then when I had an anchor point I started looking for best solutions.

I wrote a python script (load_seed_data.py), its role was to handle a highly inconsistent and dirty legacy dataset.

Script steps:
- Duplicate and garbage removal - Removes completely degenerated records that didnt say absolutely anything about the device, like everythink "Unknown", "Null"
- Data formatting - Normalizes dates (handles multiple formats) and strips not needed brand names from device names.
- Status Overrides - Forces "Repair" status if an "Available" item has notes mentioning damage like "broken", "damaged" etc.
- Rented device with no one assigned - Reverts to "Available" if an item is marked "In Use" but has no user assigned (orphaned).
- Creating accounts - Automatically creates missing User accounts with default password from env variable and active rental records for assigned devices.

## The "Correction"
- AI tried to convince me that frontend guard for admin panel is enough, because even if some user gets in every endpoint on that site will return 403 Forbidden so kept creating new chats and asking for a best solution in order to make backend bulletproof
- Issues with moving jwt from localstorage to cookies httponly, there was a long fight causing all of the http errors because frontend didnt know how to read them, ended up with the smart ai solution
- I couldnt find a fix for redirect loop and neither could AI, it turned out that there was a tug of war between frontend and backend and the main issue was a backslash in the api link which was causing permanent redirect


## Prompt trail
### I lost some of my ai chat history because some of the chats, especially debugging ones got so long to the point where the context is lost and I cant retrieve the data because it doesnt scroll up anymore

Wysłano zapytanie: Jesteś senior software engineer potrzebuję stworzyć aplikacje webowa dashboard "Hardware manager", backend python django, frontend next.js, baza sqlite - zakładki: hardware list (tutaj jest wyświetlana tabela wszystkich urządzeń w systemie wraz se statusami (available, rented, in repair) i przyciskiem rent który jest możliwy do wciśnięcia tylko jeśli sprzęt jest dostępny, sorting i filtering urządzeń), my rentals gdzie pojawiają się wszystkie wypożyczone sprzęty usera w formie tabeli, admin panel który jest dedykowaną zakładką dla admina, z jej poziomu admin może dodawać, usuwać, edytować urządzenia oraz oznaczać je jako "in repair", ponadto z poziomu tego panelu admin może dodawać nowe konta userów (to jedyny sposób na uzyskanie dostepu do systemu) - rental engine (logika biznesowa) - uzytkownicy powinni moc wypozyczac sprzet (status -> in use) i "zwracać go", powinny zostac zaimplementowane guardy zeby upewnic sie ze system wypozyczalni jest logiczny i zapobiega niemozliwym działaniom (np. wypożyczanie sprzętu który nie jest dostępny) stwórz mi roadmape

Wysłano zapytanie: potrzebuję przetworzyć poczatkowy json z którym startuje aplikacja ma on sporo zdegenerowanych danych jak powtarzajace sie id pola unknown zle oznaczone statusy powtarzajacy sie brand urzadzenia w nazwie przypisanie niestniejacego uzytkownika do sprzetu [ { "id": 1, "name": "Apple iPhone 13 Pro Max", "brand": "Apple", "purchaseDate": "2021-11-23", "status": "Available" }, { "id": 2, "name": "Apple MacBook Pro 13", "brand": "Apple", "purchaseDate": "2021-12-20", "status": "In Use" }, { "id": 3, "name": "Razer Basilisk V2", "brand": "Razer", "purchaseDate": "2021-06-05", "status": "Repair" }, { "id": 4, "name": "SAMSUNG Galaxy S21", "brand": "Samsung", "purchaseDate": "2021-11-23", "status": "Available" }, { "id": 5, "name": "Dell XPS 15 9510", "brand": "Dell", "purchaseDate": "2022-03-15", "status": "Available", "notes": "Battery swelling, do not issue without service." }, { "id": 6, "name": "Logitech MX Master 3", "brand": "Logitech", "purchaseDate": "2027-10-10", "status": "Available" }, { "id": 7, "name": "Sony WH-1000XM4", "brand": "Sony", "purchaseDate": "2022-01-12", "status": "In Use", "assignedTo": "j.doe@booksy.com" }, { "id": 4, "name": "Duplicate ID Test Laptop", "brand": "Lenovo", "purchaseDate": "2023-01-01", "status": "Repair" } ]

Wysłano zapytanie: które lepsze? Axios (do zapytań API) oraz TanStack Query (React Query) do zarządzania stanem danych? Czy lepiej przechowywac tokeny JWT w localStorage czy w cookies?

Wysłano zapytanie: mam problem z logowaniem: - logowanie złym userem wyswietla adekwatny błąd - logowanie poprawnym userem (loguje sie superuserem) nie pokazuje zadnego bledu w network ani konsoli ale ekran zostaje na ekranie logowania, zmiana sciezki tez nie dziala

Wysłano zapytanie: przy zwracaniu wypożyczonego urządzenia pojawia się POST 500: ValueError at /api/hardware/undefined/return_hardware/ Field 'id' expected a number but got 'undefined'. czy jesteś w stanie zespotować problem?

Wysłano zapytanie: zrob tak aby ten fragment z views.py obsługiwał toggle dla przycisku repair

Wysłano zapytanie: jeśli sprzęt jest wypożyczony to nie może zostać oznaczony do naprawy, toggle powinien działać tylko pomiedzy available i repair, że można było oznaczyć sprzęt in repair najpierw osoba musi go zwrócić co już jest zaimplementowane

Wysłano zapytanie: potrzebuje stworzyc logowanie przy pomocy tylko emaila, przy okazji robienia migracji chciałbym również aby urządzenia wyświetlały w tabeli date dodania, nie ma takiej domyślnie w seed_data ale powinno sie automatycznie tworzyć z aktualną datą

Wysłano zapytanie: po przejsciu na custom user modal nie moge sie zalogowac do panelu admina django ścieżka: http://127.0.0.1:8000/admin/auth/user/ błąd: Page not found (404) Request Method: GET Request URL: http://127.0.0.1:8000/admin/auth/user/ Raised by: django.contrib.admin.sites.catch_all_view Using the URLconf defined in config.urls, Django tried these URL patterns, in this order: admin/ [name='index'] admin/ login/ [name='login'] admin/ logout/ [name='logout'] admin/ password_change/ [name='password_change'] admin/ password_change/done/ [name='password_change_done'] admin/ autocomplete/ [name='autocomplete'] admin/ jsi18n/ [name='jsi18n'] admin/ r/<path:content_type_id>/<path:object_id>/ [name='view_on_site'] admin/ auth/group/ admin/ hardware/hardware/ admin/ hardware/rental/ admin/ ^(?P<app_label>auth|hardware)/$ [name='app_list'] admin/ (?P<url>.*)$ The current path, admin/auth/user/, matched the last one. You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard 404 page. 

Wysłano zapytanie: dashboard ma zakładke dedykowaną tylko dla admina, jeżeli wejde na usera to oczywiście jest ona niewidoczna dla niego ale jeżeli wpisze manualnie w link adres tej zakładki czyli http://localhost:3000/dashboard/list to przechodzi endpoint GET 200 i przekierowanie na strone główną GET schemehttphostlocalhost:3000filename/dashboard/admin Adres127.0.0.1:3000 Stan200 OK WersjaHTTP/1.1 Przesłano5,05 kB (o rozmiarze 16,45 kB) Priorytet żądaniaHighest Rozwiązywanie DNSSystemowe guard frontendowy dziala ale serwuje GET200, jak zabezpieczyc na backendzie

Wysłano zapytanie: znalazłem powazna lukę pod względem bezpieczeństwa, usunałem z page.tsx po stronie frontendu guard i wbiłem sie tam jakbym był adminem, wszystkie endpointy rzucaja 403 forbidden czyli tak jak nalezy ale zwykly user nawet nie powinien tej strony wyswietlic, jak zrobic po stronie backendu zeby tu byl zawsze instant redirect zanim front w ogole chwyci zadanie i rzuci GET200

Wysłano zapytanie: przenosimy token z localstorage na ciasteczka tak aby zablokować nieautoryzowany dostęp do panelu admina

Wysłano zapytanie: strona strasznie zwolniła po zmianach w obecnej przegladarce wpadam w redirect loop, na innej wchodzi normalnie czy to jakis problem z waznoscia tokena

Wysłano zapytanie: zmieniłem proxy.ts zgodnie z twoim pomysłem, bez usuwania ciasteczek w firefoxie i dalej mam tą pętle, czy to normalne?

Wysłano zapytanie: czemu metode put/patch sie pisze tak a nie jak w przypadku post @action(detail=True, methods=['post'])?

Wysłano zapytanie: put/patch powinien moc zmieniac tylko name brand serial number i kategorie

Wysłano zapytanie: czy ta metoda jest dalej valid jeżeli chcemy aby admin mógł edytować nazwe, brand, serial number i kategorie?     def update(self, request, *args, **kwargs):         # Pobieramy sprzęt z bazy         instance = self.get_object()                 # Sprawdzamy, jaki nowy status przysyła admin w formularzu         new_status = request.data.get('status', instance.status)         # GUARD: Chronimy logikę biznesową!         # Jeśli sprzęt jest u pracownika, a admin próbuje zmienić status np. na Repair         if instance.status == 'In Use' and new_status != 'In Use':             return Response(                 {"detail": "Cannot change the status of hardware that is currently rented. User must return it first."},                 status=status.HTTP_400_BAD_REQUEST             )                     # Jeśli sprzęt nie jest In Use (albo admin nie zmienia statusu, a tylko notatki/serial number),         # pozwalamy DRF na standardowy zapis do bazy         return super().update(request, *args, **kwargs)

Wysłano zapytanie: edycja urządzenia zwraca PATCH 403 Forbidden plik /api/admin/hardware/1/ tak wyglada fragment logiki edycji   const updateMutation = useMutation({     mutationFn: ({ id, data }: { id: number; data: Partial<Hardware> }) =>       api.patch(`/admin/hardware/${id}/`, data),     onSuccess: () => {       queryClient.invalidateQueries({ queryKey: ['hardware'] });       setIsEditModalOpen(false);     },   });

Wysłano zapytanie: jeżeli przy edycji dostaje PATCH 500, tylko w przypadku kiedy serial number zostawiam deafultowo pusty to jest to problem tego że backend oczekuje podania tej wartosci? konsola backendu pokazuje to: Internal Server Error: /api/admin/hardware/4/ Traceback (most recent call last):   File "C:\Users\sebek\Desktop\booksy\backend\venv\Lib\site-packages\django\db\backends\utils.py", line 105, in _execute     return self.cursor.execute(sql, params)           

Wysłano zapytanie: ale czy ten sessionid jest tam potrzebny? i czy ta aplikacja jest podatna na CSRF?

Wysłano zapytanie: walidacja w przypadku tworzenia i logowania @booksy.com znajduje sie tylko po stronie frontendu trzeba to zabezpieczyc na backendzie

Wysłano zapytanie: logowanie pokazuje błąd "Invalid username or password." a w konsoli POST 400 non_field_errors[ "Invalid domain. Please use @TEST.com" ]0"Invalid domain. Please use @TEST.com"

Wysłano zapytanie: czy to jest dobry response w przypadku niestniejacego usera? No active account found with the given credentials nie chce wskazywac na istniejace/nieistniejace konta

Wysłano zapytanie: znajdz table layout i napraw plywajace kolumny przy zwalnianiu urzadzen

Wysłano zapytanie: chcialbym zaimplementowac semantic search do przeszukiwania urzadzen tak zeby robic to jezykiem naturalnym, czy da sie to zrobic za darmo

Wysłano zapytanie: na co musze uwazac zeby nie zleakowac zadnych credentialow klucz api do pliku ze zmiennymi srodowiskowymi i plik w gitignore?

Wysłano zapytanie: co to jest? An environment file is configured but terminal environment injection is disabled. Enable "python.terminal.useEnvFile" to use environment variables from .env files in terminals.

Wysłano zapytanie: zaimplementowałem to na froncie w taki sposób i użycie tego rzuca POST 405 Method not allowed, co jest problemem?

Wysłano zapytanie: teraz po kliknieciu przycisku chwile mieli i zwraca POST 500 error"AI service is currently unavailable." czyli django nie umie zczytac api key z enva?

Wysłano zapytanie: dokladnie tak: CRITICAL AI ERROR:   No API_KEY or ADC found. Please either:     - Set the `GOOGLE_API_KEY` environment variable.     - Manually pass the key with `genai.configure(api_key=my_api_key)`.     - Or set up Application Default Credentials, see https://ai.google.dev/gemini-api/docs/oauth for more information. Internal Server Error: /api/hardware/semantic-search/ [31/Mar/2026 01:08:48] "POST /api/hardware/semantic-search/ HTTP/1.1" 500 315

Wysłano zapytanie: załapał ale teraz POST 500 error jaki inny model gemini bedzie do tego najlepszy, nie musi byc mocny bo to proste zadanie, zeby mial jak najwyzszy wspolczynnik token usage do inteligencji"Szczegóły: 404 models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods."

Wysłano zapytanie: zastosowałem model gemini-2.5-flash-lite i zwrócił mi 2 rezultaty ale nie zostały one zastosowane do tabeli

Wysłano zapytanie: działa, jedno zapytanie ściąga około 400 tokenów, jak to zoptymalizowac, czy to dobre zuzycie

Wysłano zapytanie: wygeneruj mi skrypt do testowania, potrzebuje sprawdzac: wypozyczanie sprzetu ktory ma status "repair", race condition na wypozyczenie tego samego przedmiotu w jednym czasie, poprawny zwrot equipmentu i aktualizacja statusu, brak dostepu zwyklego usera do zakazanych sciezek

Wysłano zapytanie: o czym należy pamiętać przed deployem aplikacji zeby nic nie zleakowac backend python django rest + frontend next.js + sqlite database

Wysłano zapytanie: co jest powodem tego że aplikacja czasami wpada w pętle przekierowań? refresh ekranu logowania 307 i tak w kółko, po wejściu w inną przeglądarke albo po wyczyszczeniu ciasteczek problem znika?

Wysłano zapytanie: czy to jest poprawna diagnoza? Aplikacja wpada w pętlę przekierowań (Redirect Loop) z powodu braku weryfikacji ważności tokena na poziomie Middleware w wyścigach z backendem. co sie dzieje pod maska?

Wysłano zapytanie: teraz pora na deploy, co proponujesz? myślałem render dla backendu, vercel dla frontendu do tego bym chciał konteneryzacje i nginx jako reverse proxy

Wysłano zapytanie: tutaj w tych dwóch secure na True?             response.set_cookie(                 'access_token',                 access_token,                 max_age=24 * 60 * 60,  # 1 day (according to SIMPLE_JWT)                 httponly=True,                 samesite='Lax',                 secure=False, # Change to True in production (requires HTTPS)             )                         # set cookie refresh token             response.set_cookie(                 'refresh_token',                 refresh_token,                 max_age=7 * 24 * 60 * 60, # 7 days                 httponly=True,                 samesite='Lax',                 secure=False,             )

Wysłano zapytanie: Enable Shell Access Upgrade your instance and get more out of Render. Shell is not supported for free instance types. Upgrading to the Starter instance type also includes:Zero downtime Web shell and SSH access Persistent Disks One-off jobs Scaling to jak mam sie zalogować do systemu na admina 

Wysłano zapytanie: złe dane logowania zwracają poprawnie 401 ale zalogowanie sie na superusera zwraca to i wpada w redirect loop: GEThttps://hardware-hub-mondel.vercel.app/dashboard/list Stan „Early Hints”103 Stan307 WersjaHTTP/2 Przesłano3,72 kB (o rozmiarze 0 B) Zasada polecającegostrict-origin-when-cross-origin Priorytet żądaniaHighest Rozwiązywanie DNSSystemowe GEThttps://hardware-hub-mondel.vercel.app/login Stan „Early Hints”103 Stan304 WersjaHTTP/2 Przesłano3,49 kB (o rozmiarze 12,11 kB) Zasada polecającegostrict-origin-when-cross-origin Priorytet żądaniaHighest Rozwiązywanie DNSSystemowe

Wysłano zapytanie: dalej nie działa, to samo w Network, konsola pokazuje jeszcze cos takiego: Ostrzeżenia ciasteczek 2 Ciasteczko „access_token” wkrótce zostanie odrzucone, ponieważ jest obce i nie ma atrybutu „Partitioned”. token Ciasteczko „refresh_token” wkrótce zostanie odrzucone, ponieważ jest obce i nie ma atrybutu „Partitioned”. token Przeniesiono do „https://hardware-hub-mondel.vercel.app/dashboard/list” 

Wysłano zapytanie: czemu plik musi sie nazywac middleware? w nowych wersjach chyba jest to proxy.ts?

Wysłano zapytanie: działa logowanie ale są jeszcze inne problemy nie moge dodawac nowych userów z panelu admina django, problemem jest custom user model?

Wysłano zapytanie: caly czas dostaje 308 -> 200 tak jakby front albo backend poprawial linki przekierowan ale aplikacja dziala, co moze byc problemem ciaglego 308 dla kazdego endpointu, na localhoscie problem nie wystepowal














