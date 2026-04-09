const API_KEY = "2805c647d6b9448a313902b334c0ffc6";

window.onload = function() {
  const userLang = localStorage.getItem("farmerLanguage") || "en";

  const FARM_DATA = {
    soil: "NPK Balanced Fertilizer\nNeem Oil Spray",
    market: "Rice: ₹2500/quintal\nMaize: ₹1800/quintal\nGroundnut: ₹6200/quintal",
    yield: "Expected Yield: 22 quintals/acre\nEstimated Profit: ₹18,000",
    bestSell: [
      { name_en: "Paddy (Rice)", name_te:"వరి", name_hi:"धान", price:"₹2500/quintal", demand:"High" },
      { name_en: "Maize", name_te:"మొక్కజొన్న", name_hi:"मक्का", price:"₹1800/quintal", demand:"Medium" },
      { name_en: "Groundnut", name_te:"వేరుశెనగ", name_hi:"मूंगफली", price:"₹6200/quintal", demand:"High" }
    ]
  };

  const translations = {
    en: { 
      cropNames:{paddy:"Paddy (Rice)",maize:"Maize",groundnut:"Groundnut"},
      irrigation:{paddy:"Water once in 2 days",maize:"Water once in 3 days",groundnut:"Light watering every 4 days"},
      safe:"✅ Safe", fungal:"⚠️ Fungal risk", diseaseSafe:"No major disease risk", diseaseRisk:"Leaf Blight Risk\nUse Copper Oxychloride"
    },
    te: { 
      cropNames:{paddy:"వరి",maize:"మొక్కజొన్న",groundnut:"వేరుశెనగ"},
      irrigation:{paddy:"2 రోజులకు ఒకసారి నీరు పెట్టండి",maize:"3 రోజులకు ఒకసారి నీరు పెట్టండి",groundnut:"4 రోజులకు తేలికగా నీరు పెట్టండి"},
      safe:"✅ సురక్షితం", fungal:"⚠️ ఫంగస్ ప్రమాదం", diseaseSafe:"పెద్దగా వ్యాధి ప్రమాదం లేదు", diseaseRisk:"ఆకు మచ్చ వ్యాధి ప్రమాదం\nకాపర్ ఆక్సీక్లోరైడ్ వాడండి"
    },
    hi: { 
      cropNames:{paddy:"धान",maize:"मक्का",groundnut:"मूंगफली"},
      irrigation:{paddy:"हर 2 दिन में पानी दें",maize:"हर 3 दिन में पानी दें",groundnut:"हर 4 दिन हल्का पानी दें"},
      safe:"✅ सुरक्षित", fungal:"⚠️ फंगल जोखिम", diseaseSafe:"कोई बड़ा रोग जोखिम नहीं", diseaseRisk:"लीफ ब्लाइट का खतरा\nकॉपर ऑक्सीक्लोराइड उपयोग करें"
    }
  };

  // Set static cards
  document.getElementById("soil").textContent = FARM_DATA.soil;
  document.getElementById("market").textContent = FARM_DATA.market;
  document.getElementById("yield").textContent = FARM_DATA.yield;

  // Crop suitability calculation
  function calcSuitability(temp, hum){
    const t = translations[userLang];
    const crops = [
      { name:t.cropNames.paddy, irrigation:t.irrigation.paddy, idealTemp:[28,32], idealHum:[70,90], profit:18000 },
      { name:t.cropNames.maize, irrigation:t.irrigation.maize, idealTemp:[22,30], idealHum:[60,80], profit:14000 },
      { name:t.cropNames.groundnut, irrigation:t.irrigation.groundnut, idealTemp:[20,28], idealHum:[50,70], profit:22000 }
    ];

    crops.forEach(c=>{
      // Temp score
      const avgTemp = (c.idealTemp[0]+c.idealTemp[1])/2;
      let tempScore = Math.max(0, 100 - Math.abs(avgTemp - temp)*5);
      // Humidity score
      const avgHum = (c.idealHum[0]+c.idealHum[1])/2;
      let humScore = Math.max(0, 100 - Math.abs(avgHum - hum)*2);
      // Profit score normalized
      let profitScore = (c.profit/22000)*100;
      // Final suitability
      c.suitability = Math.round(0.5*tempScore + 0.3*humScore + 0.2*profitScore);
    });

    crops.sort((a,b)=>b.suitability - a.suitability);
    return crops.slice(0,3);
  }

  function getBestSelling() {
    const lang = userLang;
    return FARM_DATA.bestSell.map(c=>{
      let name = lang==="en"?c.name_en:(lang==="te"?c.name_te:c.name_hi);
      return `${name}: ${c.price} | Demand: ${c.demand}`;
    }).join("\n");
  }

  function updateDashboard(temp, hum, locName, lat, lon){
    const t = translations[userLang];
    document.getElementById("location").textContent = `${locName}\nLat: ${lat.toFixed(2)} | Lon: ${lon.toFixed(2)}`;
    document.getElementById("weather").textContent = `${temp}°C\nHumidity: ${hum}%`;

    const topCrops = calcSuitability(temp, hum);
    document.getElementById("crop").textContent = topCrops.map((c,i)=>`${i+1}. ${c.name} - ${c.suitability}%`).join("\n");
    document.getElementById("irrigation").textContent = topCrops.map(c=>c.irrigation).join("\n");

    document.getElementById("alerts").textContent = hum>80 ? t.fungal : t.safe;
    document.getElementById("disease").textContent = hum>80 ? t.diseaseRisk : t.diseaseSafe;

    // 7-day forecast demo
    document.getElementById("forecast").textContent = [
      "Mon:31°C 🌧20%","Tue:30°C 🌧30%","Wed:29°C 🌧10%",
      "Thu:32°C 🌧5%","Fri:31°C 🌧0%","Sat:30°C 🌧25%","Sun:28°C 🌧15%"
    ].join("\n");

    document.getElementById("bestSell").textContent = getBestSelling();
  }

  // Geolocation + live weather
  navigator.geolocation.getCurrentPosition(
    (pos)=>{
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then(res=>res.json())
        .then(data=>{
          const temp = data.main.temp;
          const hum = data.main.humidity;
          const locName = data.name;
          updateDashboard(temp, hum, locName, lat, lon);
        })
        .catch(err=>{
          console.error("Weather API error", err);
          updateDashboard(28,65,"Demo Farm",0,0);
        });
    },
    (err)=>{
      console.warn("Geolocation error:", err.message);
      updateDashboard(28,65,"Demo Farm",0,0);
    }
  );

}