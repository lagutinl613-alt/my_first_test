// Game State
const gameState = {
    currency: 100,
    xp: 0,
    level: 1,
    skillPoints: 0,
    inventory: {},
    skills: {},
    selectedCards: new Set(),
    notifications: [],
    statistics: {
        totalCardsCollected: 0,
        packsOpened: 0,
        cardsSold: 0,
        totalCurrencyEarned: 0
    },
    sortBy: 'rarity',
    filterBy: 'all'
};

// Card Configuration
const CARD_CONFIG = {
    common: { xp: 10, value: 5, weight: 50 },
    rare: { xp: 25, value: 15, weight: 30 },
    epic: { xp: 50, value: 35, weight: 15 },
    legendary: { xp: 100, value: 75, weight: 5 }
};

const PACK_COST = 50;
const CARDS_PER_PACK = 5;
const BASE_XP_REQUIREMENT = 100;

// Skill Effects Configuration
const SKILL_EFFECTS = {
    pack_discount: 10,
    better_cards_common_reduction: 10,
    better_cards_rare_increase: 5,
    better_cards_epic_increase: 3,
    better_cards_legendary_increase: 2,
    more_cards_count: 7,
    increased_value_multiplier: 1.5,
    xp_boost_multiplier: 1.25,
    lucky_packs_chance: 0.2
};

// Card Names
const CARD_NAMES = {
    common: ['Stone Guardian', 'Wooden Shield', 'Iron Dagger', 'Copper Coin', 'Cloth Armor',
             'Basic Sword', 'Simple Bow', 'Leather Boots', 'Bronze Helm', 'Training Staff'],
    rare: ['Silver Blade', 'Emerald Ring', 'Steel Armor', 'Crystal Wand', 'Ruby Amulet',
           'Sapphire Shield', 'Golden Arrow', 'Mystic Robe', 'Diamond Dagger', 'Platinum Crown'],
    epic: ['Dragon Scale', 'Phoenix Feather', 'Titan Hammer', 'Void Crystal', 'Storm Blade',
           'Celestial Bow', 'Infernal Axe', 'Arcane Orb', 'Thunder Staff', 'Shadow Cloak'],
    legendary: ['Excalibur', 'Mjolnir', 'Aegis Shield', 'Infinity Gauntlet', 'Death Scythe',
                'Holy Grail', 'Eternal Flame', 'Cosmic Crown', 'Sword of Legends', 'Godslayer']
};

// Skill Tree Configuration
const SKILL_TREE = [
    {
        id: 'pack_discount',
        name: 'Pack Discount',
        description: 'Reduce pack cost by 10 currency',
        cost: 1,
        unlocked: false
    },
    {
        id: 'better_cards',
        name: 'Better Cards',
        description: 'Increase chance of getting rare and above cards',
        cost: 2,
        unlocked: false
    },
    {
        id: 'more_cards',
        name: 'More Cards Per Pack',
        description: 'Get 7 cards per pack instead of 5',
        cost: 2,
        unlocked: false
    },
    {
        id: 'increased_value',
        name: 'Increased Card Value',
        description: 'Cards sell for 50% more currency',
        cost: 3,
        unlocked: false
    },
    {
        id: 'xp_boost',
        name: 'XP Boost',
        description: 'Gain 25% more XP from cards',
        cost: 2,
        unlocked: false
    },
    {
        id: 'lucky_packs',
        name: 'Lucky Packs',
        description: 'Small chance to get bonus cards in packs',
        cost: 3,
        unlocked: false
    }
];

// Initialize game
function initGame() {
    // Initialize skills
    SKILL_TREE.forEach(skill => {
        gameState.skills[skill.id] = false;
    });

    loadGame();
    updateUI();
    renderSkillTree();
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('open-pack-btn').addEventListener('click', () => openPacks(1));
    document.getElementById('open-5-packs-btn').addEventListener('click', () => openPacks(5));
    document.getElementById('open-10-packs-btn').addEventListener('click', () => openPacks(10));
    document.getElementById('sell-selected-btn').addEventListener('click', sellSelectedCards);
    document.getElementById('select-all-btn').addEventListener('click', selectAllCards);
    document.getElementById('deselect-all-btn').addEventListener('click', deselectAllCards);
    document.getElementById('select-common-btn').addEventListener('click', () => selectByRarity('common'));
    document.getElementById('select-rare-btn').addEventListener('click', () => selectByRarity('rare'));
    document.getElementById('select-epic-btn').addEventListener('click', () => selectByRarity('epic'));
    document.getElementById('select-legendary-btn').addEventListener('click', () => selectByRarity('legendary'));
    document.getElementById('sort-select').addEventListener('change', (e) => {
        gameState.sortBy = e.target.value;
        renderInventory();
    });
    document.getElementById('filter-select').addEventListener('change', (e) => {
        gameState.filterBy = e.target.value;
        renderInventory();
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Get XP required for next level
function getXPRequirement(level) {
    return Math.floor(BASE_XP_REQUIREMENT * Math.pow(1.5, level - 1));
}

// Open packs (single or multiple)
function openPacks(count = 1) {
    const packCost = getPackCost();
    const totalCost = packCost * count;
    
    if (gameState.currency < totalCost) {
        showNotification(`Not enough currency! Need ${totalCost} for ${count} pack(s).`, 'error');
        return;
    }

    gameState.currency -= totalCost;
    gameState.statistics.packsOpened += count;
    
    const allCards = [];
    for (let p = 0; p < count; p++) {
        const cardsInPack = getCardsPerPack();
        for (let i = 0; i < cardsInPack; i++) {
            allCards.push(generateCard());
        }

        // Add bonus card with lucky packs skill
        if (gameState.skills.lucky_packs && Math.random() < SKILL_EFFECTS.lucky_packs_chance) {
            allCards.push(generateCard());
        }
    }

    displayPackResults(allCards, count);
    
    allCards.forEach(card => {
        addCardToInventory(card);
        addXP(card.xp);
        gameState.statistics.totalCardsCollected++;
    });

    updateUI();
    saveGame();
}

// Get pack cost with skills
function getPackCost() {
    let cost = PACK_COST;
    if (gameState.skills.pack_discount) {
        cost -= SKILL_EFFECTS.pack_discount;
    }
    return Math.max(cost, 10);
}

// Get cards per pack with skills
function getCardsPerPack() {
    return gameState.skills.more_cards ? SKILL_EFFECTS.more_cards_count : CARDS_PER_PACK;
}

// Generate a random card
function generateCard() {
    const rarities = Object.keys(CARD_CONFIG);
    let weights = rarities.map(r => CARD_CONFIG[r].weight);

    // Adjust weights with better_cards skill
    if (gameState.skills.better_cards) {
        weights[0] -= SKILL_EFFECTS.better_cards_common_reduction; // common
        weights[1] += SKILL_EFFECTS.better_cards_rare_increase;  // rare
        weights[2] += SKILL_EFFECTS.better_cards_epic_increase;  // epic
        weights[3] += SKILL_EFFECTS.better_cards_legendary_increase;  // legendary
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    let rarity = rarities[0];
    for (let i = 0; i < rarities.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            rarity = rarities[i];
            break;
        }
    }

    const config = CARD_CONFIG[rarity];
    const names = CARD_NAMES[rarity];
    const name = names[Math.floor(Math.random() * names.length)];

    let xp = config.xp;
    if (gameState.skills.xp_boost) {
        xp = Math.floor(xp * SKILL_EFFECTS.xp_boost_multiplier);
    }

    return {
        name,
        rarity,
        xp,
        value: config.value
    };
}

// Display pack results
function displayPackResults(cards, packCount = 1) {
    const resultDiv = document.getElementById('pack-result');
    resultDiv.innerHTML = `<h3>You opened ${packCount} pack(s) and got:</h3>`;
    
    // Group cards by rarity for better display
    const rarityGroups = { legendary: [], epic: [], rare: [], common: [] };
    cards.forEach(card => rarityGroups[card.rarity].push(card));
    
    Object.entries(rarityGroups).forEach(([rarity, groupCards]) => {
        if (groupCards.length > 0) {
            groupCards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.className = `card card-${card.rarity} card-appear`;
                cardDiv.innerHTML = `
                    <div class="card-name">${card.name}</div>
                    <div class="card-rarity">${card.rarity}</div>
                    <div class="card-xp">+${card.xp} XP</div>
                `;
                resultDiv.appendChild(cardDiv);
            });
        }
    });

    // Show summary
    const summary = document.createElement('div');
    summary.className = 'pack-summary';
    const totalXP = cards.reduce((sum, card) => sum + card.xp, 0);
    summary.innerHTML = `<strong>Total: ${cards.length} cards, +${totalXP} XP</strong>`;
    resultDiv.appendChild(summary);

    // Clear after 5 seconds
    setTimeout(() => {
        resultDiv.style.opacity = '0';
        setTimeout(() => {
            resultDiv.innerHTML = '';
            resultDiv.style.opacity = '1';
        }, 300);
    }, 5000);
}

// Add card to inventory
function addCardToInventory(card) {
    const key = `${card.name}_${card.rarity}`;
    if (gameState.inventory[key]) {
        gameState.inventory[key].count++;
    } else {
        gameState.inventory[key] = {
            ...card,
            count: 1
        };
    }
}

// Add XP and check for level up
function addXP(amount) {
    gameState.xp += amount;
    
    let xpNeeded = getXPRequirement(gameState.level);
    while (gameState.xp >= xpNeeded) {
        gameState.xp -= xpNeeded;
        gameState.level++;
        gameState.skillPoints++;
        xpNeeded = getXPRequirement(gameState.level);
        
        showLevelUpNotification();
    }
}

// Show level up notification
function showLevelUpNotification() {
    showNotification(`Level Up! You are now level ${gameState.level}. You gained 1 skill point!`, 'success');
}

// Select all cards
function selectAllCards() {
    gameState.selectedCards.clear();
    const filteredCards = getFilteredCards();
    filteredCards.forEach(([key]) => {
        gameState.selectedCards.add(key);
    });
    renderInventory();
}

// Deselect all cards
function deselectAllCards() {
    gameState.selectedCards.clear();
    renderInventory();
}

// Select cards by rarity
function selectByRarity(rarity) {
    gameState.selectedCards.clear();
    Object.entries(gameState.inventory).forEach(([key, card]) => {
        if (card.rarity === rarity) {
            gameState.selectedCards.add(key);
        }
    });
    renderInventory();
    showNotification(`Selected all ${rarity} cards`, 'info');
}

// Sell selected cards
function sellSelectedCards() {
    if (gameState.selectedCards.size === 0) {
        showNotification('No cards selected!', 'error');
        return;
    }

    let totalValue = 0;
    let cardsSold = 0;
    const cardsToRemove = [];

    gameState.selectedCards.forEach(key => {
        const card = gameState.inventory[key];
        if (card) {
            let value = card.value;
            if (gameState.skills.increased_value) {
                value = Math.floor(value * SKILL_EFFECTS.increased_value_multiplier);
            }
            totalValue += value * card.count;
            cardsSold += card.count;
            cardsToRemove.push(key);
        }
    });

    cardsToRemove.forEach(key => {
        delete gameState.inventory[key];
    });

    gameState.currency += totalValue;
    gameState.statistics.cardsSold += cardsSold;
    gameState.statistics.totalCurrencyEarned += totalValue;
    gameState.selectedCards.clear();

    showNotification(`Sold ${cardsSold} card(s) for ${totalValue} currency!`, 'success');
    updateUI();
    saveGame();
}

// Toggle card selection
function toggleCardSelection(key) {
    if (gameState.selectedCards.has(key)) {
        gameState.selectedCards.delete(key);
    } else {
        gameState.selectedCards.add(key);
    }
    renderInventory();
}

// Get filtered cards
function getFilteredCards() {
    let cards = Object.entries(gameState.inventory);
    
    // Apply filter
    if (gameState.filterBy !== 'all') {
        cards = cards.filter(([_, card]) => card.rarity === gameState.filterBy);
    }
    
    // Apply sort
    cards.sort((a, b) => {
        const cardA = a[1];
        const cardB = b[1];
        
        switch (gameState.sortBy) {
            case 'rarity':
                const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
                return rarityOrder[cardA.rarity] - rarityOrder[cardB.rarity];
            case 'name':
                return cardA.name.localeCompare(cardB.name);
            case 'value':
                return cardB.value - cardA.value;
            case 'quantity':
                return cardB.count - cardA.count;
            default:
                return 0;
        }
    });
    
    return cards;
}

// Unlock skill
function unlockSkill(skillId) {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    
    if (!skill) return;
    
    if (gameState.skills[skillId]) {
        showNotification('Skill already unlocked!', 'error');
        return;
    }

    if (gameState.skillPoints < skill.cost) {
        showNotification('Not enough skill points!', 'error');
        return;
    }

    gameState.skillPoints -= skill.cost;
    gameState.skills[skillId] = true;

    showNotification(`Unlocked: ${skill.name}!`, 'success');
    updateUI();
    renderSkillTree();
    saveGame();
}

// Render Inventory
function renderInventory() {
    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = '';

    const sortedCards = getFilteredCards();
    
    // Update inventory count
    const totalCards = Object.values(gameState.inventory).reduce((sum, card) => sum + card.count, 0);
    document.getElementById('inventory-count').textContent = `(${totalCards} card${totalCards !== 1 ? 's' : ''})`;

    if (sortedCards.length === 0) {
        const message = gameState.filterBy === 'all' 
            ? 'No cards yet. Open a pack to get started!'
            : `No ${gameState.filterBy} cards in inventory.`;
        inventoryDiv.innerHTML = `<p style="text-align: center; color: #666; padding: 20px; grid-column: 1 / -1;">${message}</p>`;
        return;
    }

    sortedCards.forEach(([key, card]) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card card-${card.rarity} card-inventory`;
        if (gameState.selectedCards.has(key)) {
            cardDiv.classList.add('selected');
        }
        
        let value = card.value;
        if (gameState.skills.increased_value) {
            value = Math.floor(value * SKILL_EFFECTS.increased_value_multiplier);
        }

        cardDiv.innerHTML = `
            <div class="card-count">${card.count}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity">${card.rarity}</div>
            <div class="card-xp">+${card.xp} XP</div>
            <div class="card-value">Sells for: ${value}</div>
        `;
        
        cardDiv.addEventListener('click', () => toggleCardSelection(key));
        inventoryDiv.appendChild(cardDiv);
    });
}

// Render Skill Tree
function renderSkillTree() {
    const skillTreeDiv = document.getElementById('skill-tree');
    skillTreeDiv.innerHTML = '';

    SKILL_TREE.forEach(skill => {
        const skillDiv = document.createElement('div');
        skillDiv.className = `skill ${gameState.skills[skill.id] ? 'unlocked' : 'locked'}`;
        
        skillDiv.innerHTML = `
            <div class="skill-name">${skill.name}</div>
            <div class="skill-description">${skill.description}</div>
            <div class="skill-cost">Cost: ${skill.cost} SP</div>
            ${gameState.skills[skill.id] 
                ? '<div class="skill-status">✓ Unlocked</div>'
                : `<button class="btn btn-primary" data-skill-id="${skill.id}">Unlock</button>`
            }
        `;
        
        // Add event listener to unlock button if skill is not unlocked
        if (!gameState.skills[skill.id]) {
            const unlockBtn = skillDiv.querySelector('button');
            unlockBtn.addEventListener('click', () => unlockSkill(skill.id));
        }
        
        skillTreeDiv.appendChild(skillDiv);
    });
}

// Update UI
function updateUI() {
    document.getElementById('currency').textContent = gameState.currency;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('xp').textContent = gameState.xp;
    const xpNeeded = getXPRequirement(gameState.level);
    document.getElementById('xp-needed').textContent = xpNeeded;
    document.getElementById('skill-points').textContent = gameState.skillPoints;
    
    // Update XP progress bar
    const xpPercent = (gameState.xp / xpNeeded) * 100;
    document.getElementById('xp-bar').style.width = `${xpPercent}%`;
    
    // Update statistics
    document.getElementById('total-cards').textContent = `Total Cards: ${gameState.statistics.totalCardsCollected}`;
    document.getElementById('total-packs').textContent = `Packs Opened: ${gameState.statistics.packsOpened}`;
    document.getElementById('total-sold').textContent = `Cards Sold: ${gameState.statistics.cardsSold}`;

    const packCost = getPackCost();
    const packBtn = document.getElementById('open-pack-btn');
    packBtn.textContent = `Open 1 Pack (${packCost})`;
    packBtn.disabled = gameState.currency < packCost;
    
    const pack5Btn = document.getElementById('open-5-packs-btn');
    pack5Btn.textContent = `Open 5 Packs (${packCost * 5})`;
    pack5Btn.disabled = gameState.currency < packCost * 5;
    
    const pack10Btn = document.getElementById('open-10-packs-btn');
    pack10Btn.textContent = `Open 10 Packs (${packCost * 10})`;
    pack10Btn.disabled = gameState.currency < packCost * 10;

    renderInventory();
}

// Save game to localStorage
function saveGame() {
    localStorage.setItem('cardGameSave', JSON.stringify({
        currency: gameState.currency,
        xp: gameState.xp,
        level: gameState.level,
        skillPoints: gameState.skillPoints,
        inventory: gameState.inventory,
        skills: gameState.skills,
        statistics: gameState.statistics
    }));
}

// Load game from localStorage
function loadGame() {
    const saved = localStorage.getItem('cardGameSave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameState.currency = data.currency || 100;
            gameState.xp = data.xp || 0;
            gameState.level = data.level || 1;
            gameState.skillPoints = data.skillPoints || 0;
            gameState.inventory = data.inventory || {};
            gameState.skills = data.skills || {};
            gameState.statistics = data.statistics || {
                totalCardsCollected: 0,
                packsOpened: 0,
                cardsSold: 0,
                totalCurrencyEarned: 0
            };
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', initGame);
