const fs = require('fs');
let js = fs.readFileSync('frontend/main.js', 'utf8');

// 1. In openCheckoutModal, find itemId
if (!js.includes('window.currentCheckoutItemId = matchedItem ? matchedItem.id : null;')) {
    js = js.replace(/window\.openCheckoutModal = async \(itemName, price\) => \{/,
`window.openCheckoutModal = async (itemName, price) => {
    // Find itemId
    let matchedItem = window.globalItems ? window.globalItems.find(i => i.title === itemName) : null;
    window.currentCheckoutItemId = matchedItem ? matchedItem.id : null;`);
}

// 2. In applyPromo, pass itemId
if (!js.includes('const res = await fetch(`${API_URL}/promos/verify/${promoCode}?itemId=${window.currentCheckoutItemId || ""}`);')) {
    js = js.replace(/const res = await fetch\(`\$\{API_URL\}\/promos\/verify\/\$\{promoCode\}`\);/,
`const res = await fetch(\`\${API_URL}/promos/verify/\${promoCode}?itemId=\${window.currentCheckoutItemId || ""}\`);`);
}

fs.writeFileSync('frontend/main.js', js);
console.log('fixed main.js applyPromo');
