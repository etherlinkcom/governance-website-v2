

const contracts = [
    {
        type: 'fast',
        address: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
    },
    {
        type: 'slow',
        address: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
    },
]


function checkPromotion() {
    const winning_candidate = ''; // SH.value.voting_context.period.proposal.winning_candidate
    const max_upvotes_voting_power = 0; // SH.value.voting_context.period.proposal.max_upvotes_voting_power
    // check if period has ended
    // check if (max_upvotes_voting_power / total_voting_power) * 100 > promotion_quorum
    // insert proposal into promotions table

}