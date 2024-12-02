document.getElementById("dataForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const ranksHierarchy = {
        RADIANT: 9,
        IMMORTAL: 8,
        ASCENDANT: 7,
        DIAMOND: 6,
        PLATINUM: 5,
        GOLD: 4,
        SILVER: 3,
        BRONZE: 2,
        IRON: 1,
        UNRANKED: 0,
    };

    const toCamelCase = (str) => {
        return str && str.length > 0 ? str[0].toUpperCase() + str.substring(1).toLowerCase() : null;
    };

    const toCamelCaseSkin = (str) => {
        return str.split(' ').map(e => toCamelCase(e)).join(' ');
    }

    // Helper function: Determine peak rank
    const getPeakRank = (allRanks) => {
        let mappedRanks = allRanks.map((e) => ({
            rank: ranksHierarchy[e.rank],
            tier: e.tier,
        }));

        let peakRank = mappedRanks.reduce((prev, current) => {
            if (
                current.rank > prev.rank ||
                (current.rank === prev.rank && parseInt(current.tier) > parseInt(prev.tier))
            )
                return current;
            return prev;
        });

        return { rank: Object.keys(ranksHierarchy).find((key) => ranksHierarchy[key] === peakRank.rank), tier: peakRank.tier };
    };

    // Extract user input
    const details = document.getElementById("details").value;
    const store = document.getElementById("store").value.split("\n");
    const skinsRaw = document.getElementById("skins").value.split("\n");
    const battlepassRaw = document.getElementById("battlepass").value.split("\n").filter((line) => line.trim());
    const battlepassLine = battlepassRaw.find((line) => line.includes("Total Battlepass:"));
    const battlepassCount = battlepassLine ? parseInt(battlepassLine.match(/\d+/)[0]) : 0;
    const buddiesRaw = document.getElementById("buddies").value.split("\n");
    const cardsRaw = document.getElementById("cards").value.split("\n");
    const spraysRaw = document.getElementById("sprays").value.split("\n");
    const titlesRaw = document.getElementById("titles").value.split("\n");
    const agentsRaw = document.getElementById("agents").value.split("\n").filter((line) => line.trim());

    // Extract Points from Store
    const valorantPoints = store.find((line, index) => line.includes("VP Icon") && /^\d+$/.test(store[index + 1]?.trim()))
        ? store[store.indexOf("VP Icon") + 1].trim()
        : "0";

    const radianitePoints = store.find((line, index) => line.includes("Radianite Icon") && /^\d+$/.test(store[index + 1]?.trim()))
        ? store[store.indexOf("Radianite Icon") + 1].trim()
        : "0";

    // Process weapon skins
    const skins = skinsRaw
        .slice(11, -4)
        .map((line) => line.trim())
        .filter((line) => !/^Skin Image$|^Tier Icon$|^Variant Image$|^\d+$/.test(line))
        .map((skin) => `val-${skin.toLowerCase().replace(/\s+/g, "-").replace(/\/\//g, "").replace(/\./g, "")}`);

    // Process buddies
    const buddies = buddiesRaw
        .slice(8, -4)
        .map((line) => line.trim())
        .filter((line) => line && line !== "Buddy Image")
        .map((buddy) =>
            `val-${buddy
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/\/\//g, "")
                .replace(/--+/g, "-")
                .replace(/[:',!\/\.\?\+]/g, "")
                .replace(/--+/g, "-")}`
        );

    // Process cards
    const cards = cardsRaw
        .slice(8, -4)
        .map((line) => line.trim())
        .filter((line) => line && line !== "Card Image")
        .map((card) =>
            `val-${card
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/\/\//g, "")
                .replace(/--+/g, "-")
                .replace(/[:',!\/\.\?\+]/g, "")
                .replace(/--+/g, "-")}`
        );

    // Process sprays
    const sprays = spraysRaw
        .slice(8, -4)
        .map((line) => line.trim())
        .filter((line) => line && line !== "Spray Image")
        .map((spray) =>
            `val-${spray
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/\/\//g, "")
                .replace(/--+/g, "-")
                .replace(/[:',!\/\.\?\+]/g, "")
                .replace(/--+/g, "-")}`
        );

    // Process titles
    const titles = titlesRaw
        .slice(8, -4)
        .map((line) => line.trim())
        .filter((line) => line && line !== "Title Image")
        .map((title) => {
            const cleanedTitle = title
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/\/\//g, "")
                .replace(/=/g, "")
                .replace(/_/g, "")
                .replace(/¡/g, "")
                .replace(/\^+/g, "")
                .replace(/[:',!\/\.\?\+]/g, "")
                .replace(/--+/g, "-")
                .replace(/^-+|-+$/g, "");
            return cleanedTitle ? `val-${cleanedTitle}-title` : "val-title";
        });

    // Valid agent names
    const validAgents = [
        "omen", "raze", "harbor", "vyse", "reyna", "chamber", "kay/o", "clove", "cypher", "skye",
        "killjoy", "yoru", "astra", "neon", "viper", "deadlock", "gekko", "breach", "fade", "iso",
        "sova", "sage", "phoenix", "jett", "brimstone",
    ];

    // Process agents
    const agents = agentsRaw
        .map((agent) => agent.toLowerCase().replace("agent image", "").trim())
        .filter((agent) => validAgents.includes(agent))
        .map((agent) => (agent === "kay/o" ? "val-kayo" : `val-${agent}`));

    // Account Data Section
    const validRanks = ["Unranked", "Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"];
    const validTiers = ["1", "2", "3"];

    const currentRankRegex = new RegExp(`Latest Rank(${validRanks.join("|")})\\s(${validTiers.join("|")})?`, "i");
    const previousRanksRegex = new RegExp(`Rank(${validRanks.join("|")})\\s(${validTiers.join("|")})?`, "gi");

    const currentRankMatch = details.match(currentRankRegex);
    const currentRank = currentRankMatch ? currentRankMatch[1] : null;
    const currentTier = currentRankMatch && currentRankMatch[2] ? currentRankMatch[2] : null;

    const previousRanksMatches = [...details.matchAll(previousRanksRegex)].map((match) => ({
        rank: match[1],
        tier: match[2] || null,
    }));

    const allRanks = [{ rank: currentRank, tier: currentTier }, ...previousRanksMatches];
    const peakRankObj = getPeakRank(allRanks);

    const ign = details.match(/IGN:\s*([^#\s]+)/)?.[1] || "Unknown";
    const region = details.match(/Region:\s*(.+)/)?.[1] || "Unknown";
    const level = details.match(/Level:\s*(.+)/)?.[1] || "Unknown";

    // Generate description dynamically
    const generateDescription = () => {
        const formattedSkins = skins.map((skin) => `   ✅ ${toCamelCaseSkin(skin.replace("val-", "").replace(/-/g, " "))}`).join("\n");

        return `❤️ In-Game Details ❤️

☑️ WEAPON SKINS:-
${formattedSkins}

☑️ BATTLEPASS:
   ✅ Total Battlepass Count = ${battlepassCount}

☑️ CURRENT RANK: ${toCamelCase(currentRank)} ${currentTier || ""}
☑️ PEAK RANK: ${toCamelCase(peakRankObj.rank)} ${peakRankObj.tier || ""}

☑️ Account Level = ${level}
☑️ ${valorantPoints} EXTRA VP (VALORANT POINTS) IN ACCOUNT.
☑️ ${radianitePoints} RP (RADIANITE POINTS) IN ACCOUNT.

☑️ AFTER BUYING YOU WILL RECEIVE:
   ✅ USERNAME.
   ✅ PASSWORD.
   ✅ EMAIL ACCESS.

⚠️If you face any issues, please message the seller before leaving negative feedback. The seller will work with you to solve any problems.`;
    };

    // Construct JSON
    const jsonData = [
        {
            id: 1,
            title: "",
            slug: "",
            description: generateDescription(),
            price: null,
            ign: ign,
            login: null,
            password: null,
            email_login: null,
            email_password: null,
            has_2fa: false,
            server: region,
            level_up_method: "by_hand",
            note: null,
            dump: null,
            delivery_instructions: `📩 Post Purchase Instructions 📩

🌐 Website for Email Login: https://mail.zsthost.com/

🙏 After buying, please change the email address to your own and leave a good feedback after confirming the order. ❤️`,
            is_manual: false,
            delivery_time: { duration: 0, unit: "minutes" },
            gallery: [],
            account_data: {
                current_tier: toCamelCase(currentRank),
                current_division: currentTier,
                previous_tier: toCamelCase(previousRanksMatches[0]?.rank),
                previous_division: previousRanksMatches[0]?.tier || null,
                peak_tier: toCamelCase(peakRankObj.rank),
                peak_division: peakRankObj.tier,
                level: level,
                valorant_points: valorantPoints,
                radianite_points: radianitePoints,
                winrate: null,
            },
            game_items: { agents, "weapon-skins": skins, buddies, cards, sprays, titles },
            is_duped: false,
        },
    ];

    // Download JSON
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data.json";
    link.click();
});

// Paste button functionality
function pasteText(elementId) {
    navigator.clipboard.readText().then((text) => {
        document.getElementById(elementId).value = text;
    }).catch(() => {
        alert("Failed to paste. Please allow clipboard permissions.");
    });
}
