const computeTpssFee = (transactionDTO) => {
  const { ID, Amount, SplitInfo } = transactionDTO;
  let finalBalance = Number(Amount);
  let totalRatio = 0; // to store total split value for all ratio split types

  // initialize empty array for each split type
  const flatSplitTypes = [];
  const percentageSplitTypes = [];
  const ratioSplitTypes = [];

  // iterate through splitinfo and update each repective split type array
  SplitInfo.forEach((info, index) => {
    switch (info.SplitType) {
      case "FLAT":
        flatSplitTypes.push({ ...info, index });
        break;
      case "PERCENTAGE":
        percentageSplitTypes.push({ ...info, index });
        break;
      case "RATIO":
        totalRatio += Number(info.SplitValue); // update total ratio split value
        ratioSplitTypes.push({ ...info, index });
        break;
      default:
        break;
    }
  });

  // combine them all to form a new array with the order of precedence recognised: FLAT > PERCENTAGE > RATIO
  const allSplitTypes = [].concat(
    flatSplitTypes,
    percentageSplitTypes,
    ratioSplitTypes
  );

  const finalSplitBreakDown = []; // array holding final result
  let ratioBalance;

  // compute the split info based on their type
  for (let i = 0; i < allSplitTypes.length; i++) {
    const currentSplitInfo = allSplitTypes[i];
    const resObj = {};
    if (currentSplitInfo.SplitType === "FLAT") {
      finalBalance -= Number(currentSplitInfo.SplitValue);
      resObj["SplitEntityId"] = currentSplitInfo.SplitEntityId;
      resObj["Amount"] = currentSplitInfo.SplitValue;
      finalSplitBreakDown[currentSplitInfo.index] = resObj;
    } else if (currentSplitInfo.SplitType === "PERCENTAGE") {
      const percentageSplitAmount =
        (Number(currentSplitInfo.SplitValue) / 100) * finalBalance;
      finalBalance -= Number(percentageSplitAmount);
      resObj["SplitEntityId"] = currentSplitInfo.SplitEntityId;
      resObj["Amount"] = percentageSplitAmount;
      finalSplitBreakDown[currentSplitInfo.index] = resObj;
      ratioBalance = finalBalance;
    } else if (currentSplitInfo.SplitType === "RATIO") {
      const openingRatioBalance = ratioBalance;
      const ratioSplitAmount =
        (Number(currentSplitInfo.SplitValue) / totalRatio) *
        openingRatioBalance;
      finalBalance -= Number(ratioSplitAmount);
      resObj["SplitEntityId"] = currentSplitInfo.SplitEntityId;
      resObj["Amount"] = ratioSplitAmount;
      finalSplitBreakDown[currentSplitInfo.index] = resObj;
    }
  }

  return {
    ID,
    Balance: finalBalance,
    SplitBreakdown: finalSplitBreakDown,
  };
};

export default computeTpssFee;
