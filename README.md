# DevDay-githubcopilot
Material de Apoio

## Classificador de recicláveis

Uma demonstração interativa, feita apenas com HTML, CSS e JavaScript. Escolhe
uma das cinco amostras e carrega em **Ver resultado** para consultar a categoria
e uma orientação geral de separação.

### Executar

Abre `index.html` diretamente num navegador. Não é necessária instalação nem
ligação à internet.

### Sobre os resultados

Os resultados estão preparados para as amostras desta demonstração. A aplicação
não analisa fotografias e não usa um modelo de inteligência artificial. As
orientações são genéricas; confirma sempre as regras de reciclagem da tua zona.

## Backend ESP32

O diretório `backend/` contém uma API MicroPython com Microdot. O exemplo lê um
DHT22 (temperatura e humidade) no GPIO 4 e um LDR ligado como divisor de tensão
ao ADC do GPIO 34. Ajusta os pinos em `backend/config.py` conforme a tua placa.

### Hardware de referência

- DHT22: VCC em 3V3, GND em GND e DATA no GPIO 4. Alguns módulos já incluem a
  resistência pull-up; para um sensor sem módulo, coloca uma resistência entre
  DATA e 3V3.
- LDR: usa-o num divisor de tensão e liga o ponto central ao GPIO 34. Mantém a
  tensão no pino ADC dentro do limite da placa (nunca acima de 3,3 V).

### Instalar e executar no ESP32

1. Instala firmware MicroPython compatível com a tua placa e liga-a por USB.
2. Copia os módulos `__init__.py`, `microdot.py` e `cors.py` da pasta
	`src/microdot` do [repositório Microdot](https://github.com/miguelgrinberg/microdot)
	para `/lib/microdot/` no ESP32. A extensão CORS é necessária para o browser
	aceder à API servida noutro endereço.
3. Em `backend/config.py`, configura `WIFI_SSID` e `WIFI_PASSWORD`. Confirma
	também que a origem usada pelo front-end está em `CORS_ALLOWED_ORIGINS`.
4. Copia `backend/config.py`, `backend/sensors.py` e `backend/main.py` para a
	raiz do sistema de ficheiros do ESP32 e executa `main.py`.
5. Consulta a consola série: o endereço IP impresso é o endereço a introduzir
	no painel de telemetria.

O exemplo assume DHT22 e ESP32 clássico com ADC disponível no GPIO 34. O DHT22
é consultado no intervalo de 5 segundos usado pelo front-end. Outros sensores,
placas ou ligações requerem ajustar `backend/sensors.py` e os pinos de
`backend/config.py`.

### API JSON

- `GET /api/health` confirma que o serviço está ativo.
- `GET /api/sensors` responde com `ok`, `device`, `sampled_at_ms` e um objeto
  `sensors` com valor e unidade de cada leitura. Um sensor com falha tem
  `value: null`; a resposta HTTP passa a `503` se alguma leitura falhar.

Para servir o front-end no computador durante o desenvolvimento, executa
`python3 -m http.server 5500` na pasta do projeto e abre
`http://localhost:5500`. A origem deve continuar permitida em
`CORS_ALLOWED_ORIGINS`; não uses uma origem wildcard numa rede partilhada.
