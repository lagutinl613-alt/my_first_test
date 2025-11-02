// Game State
const gameState = {
    currency: 100,
    xp: 0,
    level: 1,
    skillPoints: 0,
    inventory: {},
    skills: {},
    selectedCards: new Set()
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
    document.getElementById('open-pack-btn').addEventListener('click', openPack);
    document.getElementById('sell-selected-btn').addEventListener('click', sellSelectedCards);
    document.getElementById('select-all-btn').addEventListener('click', selectAllCards);
    document.getElementById('deselect-all-btn').addEventListener('click', deselectAllCards);
}

// Get XP required for next level
function getXPRequirement(level) {
    return Math.floor(BASE_XP_REQUIREMENT * Math.pow(1.5, level - 1));
}

// Open a pack
function openPack() {
    const packCost = getPackCost();
    
    if (gameState.currency < packCost) {
        alert('Not enough currency to open a pack!');
        return;
    }

    gameState.currency -= packCost;
    
    const cardsInPack = getCardsPerPack();
    const cards = [];

    for (let i = 0; i < cardsInPack; i++) {
        cards.push(generateCard());
    }

    // Add bonus card with lucky packs skill
    if (gameState.skills.lucky_packs && Math.random() < 0.2) {
        cards.push(generateCard());
    }

    displayPackResults(cards);
    
    cards.forEach(card => {
        addCardToInventory(card);
        addXP(card.xp);
    });

    updateUI();
    saveGame();
}

// Get pack cost with skills
function getPackCost() {
    let cost = PACK_COST;
    if (gameState.skills.pack_discount) {
        cost -= 10;
    }
    return Math.max(cost, 10);
}

// Get cards per pack with skills
function getCardsPerPack() {
    return gameState.skills.more_cards ? 7 : CARDS_PER_PACK;
}

// Generate a random card
function generateCard() {
    const rarities = Object.keys(CARD_CONFIG);
    let weights = rarities.map(r => CARD_CONFIG[r].weight);

    // Adjust weights with better_cards skill
    if (gameState.skills.better_cards) {
        weights[0] -= 10; // common
        weights[1] += 5;  // rare
        weights[2] += 3;  // epic
        weights[3] += 2;  // legendary
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
        xp = Math.floor(xp * 1.25);
    }

    return {
        name,
        rarity,
        xp,
        value: config.value
    };
}

// Display pack results
function displayPackResults(cards) {
    const resultDiv = document.getElementById('pack-result');
    resultDiv.innerHTML = '<h3>You got:</h3>';
    
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card card-${card.rarity}`;
        cardDiv.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-rarity">${card.rarity}</div>
            <div class="card-xp">+${card.xp} XP</div>
        `;
        resultDiv.appendChild(cardDiv);
    });

    // Clear after 5 seconds
    setTimeout(() => {
        resultDiv.innerHTML = '';
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
    alert(`Level Up! You are now level ${gameState.level}. You gained 1 skill point!`);
}

// Select all cards
function selectAllCards() {
    gameState.selectedCards.clear();
    Object.keys(gameState.inventory).forEach(key => {
        gameState.selectedCards.add(key);
    });
    renderInventory();
}

// Deselect all cards
function deselectAllCards() {
    gameState.selectedCards.clear();
    renderInventory();
}

// Sell selected cards
function sellSelectedCards() {
    if (gameState.selectedCards.size === 0) {
        alert('No cards selected!');
        return;
    }

    let totalValue = 0;
    const cardsToRemove = [];

    gameState.selectedCards.forEach(key => {
        const card = gameState.inventory[key];
        if (card) {
            let value = card.value;
            if (gameState.skills.increased_value) {
                value = Math.floor(value * 1.5);
            }
            totalValue += value * card.count;
            cardsToRemove.push(key);
        }
    });

    cardsToRemove.forEach(key => {
        delete gameState.inventory[key];
    });

    gameState.currency += totalValue;
    gameState.selectedCards.clear();

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

// Unlock skill
function unlockSkill(skillId) {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    
    if (!skill) return;
    
    if (gameState.skills[skillId]) {
        alert('Skill already unlocked!');
        return;
    }

    if (gameState.skillPoints < skill.cost) {
        alert('Not enough skill points!');
        return;
    }

    gameState.skillPoints -= skill.cost;
    gameState.skills[skillId] = true;

    updateUI();
    renderSkillTree();
    saveGame();
}

// Render Inventory
function renderInventory() {
    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = '';

    const sortedCards = Object.entries(gameState.inventory).sort((a, b) => {
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
        return rarityOrder[a[1].rarity] - rarityOrder[b[1].rarity];
    });

    if (sortedCards.length === 0) {
        inventoryDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No cards yet. Open a pack to get started!</p>';
        return;
    }

    sortedCards.forEach(([key, card]) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card card-${card.rarity}`;
        if (gameState.selectedCards.has(key)) {
            cardDiv.classList.add('selected');
        }
        
        let value = card.value;
        if (gameState.skills.increased_value) {
            value = Math.floor(value * 1.5);
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
                : `<button class="btn btn-primary" onclick="unlockSkill('${skill.id}')">Unlock</button>`
            }
        `;
        
        skillTreeDiv.appendChild(skillDiv);
    });
}

// Update UI
function updateUI() {
    document.getElementById('currency').textContent = gameState.currency;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('xp').textContent = gameState.xp;
    document.getElementById('xp-needed').textContent = getXPRequirement(gameState.level);
    document.getElementById('skill-points').textContent = gameState.skillPoints;

    const packCost = getPackCost();
    const packBtn = document.getElementById('open-pack-btn');
    packBtn.textContent = `Open Pack (${packCost} Currency)`;
    packBtn.disabled = gameState.currency < packCost;

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
        skills: gameState.skills
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
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', initGame);
