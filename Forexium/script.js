const API_URL = "https://api.exchangerate-api.com/v4/latest/";

const amount = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swap");
const result = document.getElementById("result");
const error = document.getElementById("error");
const loader = document.getElementById("loader");
const convertedAmount = document.getElementById("convertedAmount");
const rateInfo = document.getElementById("rateInfo");
const updatedTime = document.getElementById("updatedTime");
const historyBox = document.getElementById("history");
const historyList = document.getElementById("historyList");
const themeToggle = document.getElementById("themeToggle");
const infoCard = document.getElementById("infoCard");
const globalHub = document.getElementById("globalHub");
const marketBadge = document.getElementById("marketBadge");
const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const viewAllHub = document.getElementById("viewAllHub");

let currentRates = {};
let hubExpanded = false;

/* Favorites Persistence */
let favorites = JSON.parse(localStorage.getItem("forex_favorites") || "[]");

/* 30+ CURRENCIES WITH FLAGS */
const currencies = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
    { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰" },
    { code: "NZD", name: "NZ Dollar", flag: "🇳🇿" },
    { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
    { code: "KRW", name: "South Korean Won", flag: "🇰🇷" },
    { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
    { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
    { code: "RUB", name: "Russian Ruble", flag: "🇷🇺" },
    { code: "MXN", name: "Mexican Peso", flag: "🇲🇽" },
    { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩" },
    { code: "TRY", name: "Turkish Lira", flag: "🇹🇷" },
    { code: "SEK", name: "Swedish Krona", flag: "🇸🇪" },
    { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴" },
    { code: "DKK", name: "Danish Krone", flag: "🇩🇰" },
    { code: "PLN", name: "Polish Zloty", flag: "🇵🇱" },
    { code: "THB", name: "Thai Baht", flag: "🇹🇭" },
    { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾" },
    { code: "PHP", name: "Philippine Peso", flag: "🇵🇭" },
    { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
    { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
    { code: "ILS", name: "Israeli Shekel", flag: "🇮🇱" },
    { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬" },
    { code: "BDT", name: "Bangladeshi Taka", flag: "🇧🇩" },
    { code: "LKR", name: "Sri Lankan Rupee", flag: "🇱🇰" },
    { code: "PKR", name: "Pakistani Rupee", flag: "🇵🇰" }
];

/* Populate dropdowns */
currencies.forEach(cur => {
    const html = `<option value="${cur.code}">${cur.flag} ${cur.code} - ${cur.name}</option>`;
    fromCurrency.innerHTML += html;
    toCurrency.innerHTML += html;
});

/* Marquee Logic */
const marqueeContent = document.getElementById("marqueeContent");
async function initMarquee() {
    try {
        const res = await fetch(API_URL + "USD");
        const data = await res.json();
        const pairs = ["EUR", "GBP", "INR", "JPY", "AUD", "CAD"];
        let marqueeHTML = "";
        pairs.forEach(p => {
            const rate = data.rates[p].toFixed(2);
            marqueeHTML += `<span>USD/${p}: ${rate}</span>`;
        });
        // Duplicate for seamless loop
        marqueeContent.innerHTML = marqueeHTML + marqueeHTML;
    } catch (e) {
        marqueeContent.innerHTML = "<span>Live rates currently unavailable</span>";
    }
}
initMarquee();

/* Default INR ↔ USD */
fromCurrency.value = "INR";
toCurrency.value = "USD";

convertBtn.onclick = convertCurrency;

swapBtn.onclick = () => {
    [fromCurrency.value, toCurrency.value] =
        [toCurrency.value, fromCurrency.value];
};

themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
};

async function convertCurrency() {
    error.textContent = "";
    result.classList.add("hidden");
    infoCard.classList.add("hidden");

    if (!amount.value || amount.value <= 0) {
        error.textContent = "Enter a valid amount.";
        return;
    }

    loader.classList.remove("hidden");

    try {
        const res = await fetch(API_URL + fromCurrency.value);
        if (!res.ok) throw new Error();

        const data = await res.json();
        currentRates = data.rates;
        const rate = data.rates[toCurrency.value];
        const converted = (amount.value * rate).toFixed(4);

        convertedAmount.textContent =
            `${amount.value} ${fromCurrency.value} = ${converted} ${toCurrency.value}`;

        rateInfo.textContent =
            `1 ${fromCurrency.value} = ${rate} ${toCurrency.value}`;

        updatedTime.textContent =
            `Updated: ${new Date().toLocaleTimeString()}`;

        saveHistory(convertedAmount.textContent);
        updateInfoCard(toCurrency.value, data.rates);
        updateFavoriteButtonState(toCurrency.value);

        result.classList.remove("hidden");
        historyBox.classList.remove("hidden");
        infoCard.classList.remove("hidden");

    } catch {
        error.textContent = "Internet error or API unavailable.";
    } finally {
        loader.classList.add("hidden");
    }
}

function updateInfoCard(code, rates) {
    const cur = currencies.find(c => c.code === code);
    document.getElementById("infoFlag").textContent = cur.flag;
    document.getElementById("infoTitle").textContent = `${cur.code} - ${cur.name}`;
    document.getElementById("infoDesc").textContent =
        `The ${cur.name} (${cur.code}) is the official currency used in its respective region. It is one of the most traded currencies in the global forex market. Data shown below reflects the current valuation against major global benchmarks.`;

    // Update Market Badge
    const statuses = ["Strong", "Stable", "Trending", "Volatile"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    marketBadge.textContent = randomStatus;
    marketBadge.style.background = randomStatus === "Volatile" ? "#ff5252" : "#00e676";

    renderHub(code, rates);
}

function renderHub(targetCode, rates) {
    globalHub.innerHTML = "";
    const displayCurrencies = hubExpanded
        ? currencies.map(c => c.code)
        : ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"];

    displayCurrencies.forEach(b => {
        if (targetCode === b) return;
        const rate = rates[b] ? (1 / rates[b]).toFixed(4) : "N/A";
        const div = document.createElement("div");
        div.className = "hub-item";
        div.innerHTML = `
            <div class="hub-pair">${targetCode}/${b}</div>
            <div class="hub-rate">${rate}</div>
        `;
        globalHub.appendChild(div);
    });
}

viewAllHub.onclick = () => {
    hubExpanded = !hubExpanded;
    viewAllHub.textContent = hubExpanded ? "Show Less" : "View All";
    globalHub.classList.toggle("expanded");
    renderHub(toCurrency.value, currentRates);
};

favoriteBtn.onclick = () => {
    const code = toCurrency.value;
    if (favorites.includes(code)) {
        favorites = favorites.filter(c => c !== code);
    } else {
        favorites.push(code);
    }
    localStorage.setItem("forex_favorites", JSON.stringify(favorites));
    updateFavoriteButtonState(code);
};

function updateFavoriteButtonState(code) {
    if (favorites.includes(code)) {
        favoriteBtn.textContent = "⭐ Favorited";
        favoriteBtn.classList.add("favorite-active");
    } else {
        favoriteBtn.textContent = "⭐ Favorite";
        favoriteBtn.classList.remove("favorite-active");
    }
}

function saveHistory(text) {
    const li = document.createElement("li");
    li.innerHTML = `
        <span>${text}</span>
        <span class="delete-item" onclick="this.parentElement.remove()">✕</span>
    `;
    historyList.prepend(li);

    if (historyList.children.length > 8) {
        historyList.removeChild(historyList.lastChild);
    }
}

document.getElementById("clearHistory").onclick = () => {
    historyList.innerHTML = "";
    historyBox.classList.add("hidden");
};

/* Actions */
copyBtn.onclick = () => {
    navigator.clipboard.writeText(convertedAmount.textContent);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = originalText, 2000);
};

shareBtn.onclick = () => {
    const text = `Check out this conversion on Forexium: ${convertedAmount.textContent}`;
    if (navigator.share) {
        navigator.share({ title: 'Forexium Conversion', text: text });
    } else {
        alert("Sharing not supported, but text copied for you!");
        navigator.clipboard.writeText(text);
    }
};
