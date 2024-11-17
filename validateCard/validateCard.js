function validateCard(creditCard) {
    const visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/; 
    const masterRegex = /^5[1-5][0-9]{14}$/; 
    return visaRegex.test(creditCard) || masterRegex.test(creditCard);
}

module.exports = {
    validateCard
};