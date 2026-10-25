const examples = {
  newspaper: {
    name: "Jornal",
    icon: "🗞️",
    category: "PAPEL",
    destination: "Reciclagem de papel",
    advice: "Mantém o papel seco e limpo. Se estiver molhado ou muito sujo, confirma as regras locais.",
  },
  bottle: {
    name: "Garrafa PET",
    icon: "🧴",
    category: "PLÁSTICO",
    destination: "Reciclagem de embalagens",
    advice: "Esvazia a embalagem. A separação da tampa pode variar conforme as regras da tua zona.",
  },
  jar: {
    name: "Frasco de vidro",
    icon: "🫙",
    category: "VIDRO",
    destination: "Reciclagem de vidro",
    advice: "Esvazia o frasco e coloca-o no recipiente de vidro. Não incluas loiça ou cerâmica.",
  },
  can: {
    name: "Lata de metal",
    icon: "🥫",
    category: "METAL",
    destination: "Reciclagem de embalagens",
    advice: "Esvazia a lata. Se possível, passa-a por água para retirar restos de alimentos.",
  },
  box: {
    name: "Caixa com gordura",
    icon: "📦",
    category: "OUTROS",
    destination: "Verifica as regras locais",
    advice: "Papel e cartão com gordura podem não ser recicláveis. Consulta a recolha de resíduos orgânicos da tua zona.",
  },
};

const sampleButtons = document.querySelectorAll(".sample");
const classifyButton = document.querySelector("#classify-button");
const resultOutput = document.querySelector("#result-output");
const resultIntro = document.querySelector(".result-intro");
let selectedExample = null;

sampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedExample = examples[button.dataset.sample];

    sampleButtons.forEach((sample) => {
      sample.setAttribute("aria-pressed", String(sample === button));
    });

    classifyButton.disabled = false;
    resultIntro.textContent = `${selectedExample.name} selecionado. Pronto para ver o resultado?`;
    resultOutput.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon" aria-hidden="true">✓</span>
        <p>Amostra selecionada</p>
      </div>
    `;
  });
});

classifyButton.addEventListener("click", () => {
  if (!selectedExample) return;

  resultIntro.textContent = "Resultado preparado para este exemplo.";
  resultOutput.innerHTML = `
    <div class="result-card">
      <div class="result-object">
        <span class="result-object-icon" aria-hidden="true">${selectedExample.icon}</span>
        <div>
          <p class="result-object-name">${selectedExample.destination}</p>
          <p class="result-category">${selectedExample.category}</p>
        </div>
      </div>
      <p class="result-advice">${selectedExample.advice}</p>
    </div>
  `;
});

const sensorForm = document.querySelector("#sensor-connect-form");
const sensorUrlInput = document.querySelector("#esp32-url");
const connectButton = document.querySelector("#connect-button");
const connectionStatus = document.querySelector("#connection-status");
const sensorMessage = document.querySelector("#sensor-message");
const sensorValues = {
  temperature_c: document.querySelector("#temperature-value"),
  humidity_pct: document.querySelector("#humidity-value"),
  light_raw: document.querySelector("#light-value"),
};
let sensorApiBase = "";
let sensorPollingTimer = null;
let sensorRequestInProgress = false;

function showSensorValue(element, sensor) {
  element.textContent = sensor && sensor.value !== null ? sensor.value : "--";
}

async function updateSensorReadings() {
  if (!sensorApiBase || sensorRequestInProgress) return;
  sensorRequestInProgress = true;

  try {
    const response = await fetch(`${sensorApiBase}/api/sensors`, { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok && response.status !== 503) {
      throw new Error(payload.error || `HTTP ${response.status}`);
    }

    Object.keys(sensorValues).forEach((key) => {
      showSensorValue(sensorValues[key], payload.sensors && payload.sensors[key]);
    });

    if (!payload.ok) {
      throw new Error("Um ou mais sensores não responderam. Verifica a ligação e os pinos.");
    }

    connectionStatus.textContent = "Ligado";
    connectionStatus.dataset.state = "connected";
    sensorMessage.textContent = "Leituras atualizadas agora. A próxima atualização chega em 5 segundos.";
  } catch (error) {
    connectionStatus.textContent = "Sem resposta";
    connectionStatus.dataset.state = "error";
    sensorMessage.textContent = `Não foi possível ler o ESP32: ${error.message}`;
  } finally {
    sensorRequestInProgress = false;
  }
}

sensorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (sensorPollingTimer !== null) {
    clearInterval(sensorPollingTimer);
    sensorPollingTimer = null;
    sensorApiBase = "";
    connectButton.textContent = "Ligar";
    connectionStatus.textContent = "Desligado";
    connectionStatus.dataset.state = "";
    sensorMessage.textContent = "Ligação ao ESP32 terminada.";
    return;
  }

  try {
    const parsedUrl = new URL(sensorUrlInput.value.trim());
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Usa um endereço HTTP ou HTTPS.");
    }

    sensorApiBase = parsedUrl.origin;
  } catch (error) {
    sensorMessage.textContent = `Endereço inválido: ${error.message}`;
    return;
  }

  connectButton.textContent = "Desligar";
  connectionStatus.textContent = "A ligar...";
  connectionStatus.dataset.state = "connecting";
  sensorMessage.textContent = "A pedir leituras ao ESP32...";
  updateSensorReadings();
  sensorPollingTimer = setInterval(updateSensorReadings, 5000);
});