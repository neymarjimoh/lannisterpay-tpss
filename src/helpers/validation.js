import { celebrate, Joi } from "celebrate";

export const validateTransactionObject = (req, res, next) => {
  if (req.query.format && req.query.format.toLowerCase() === "xml") {
    console.log("bify>>>>>", req.body.Root);
    console.log("fffffff", req.body.Root.SplitInfo);
    const root = req.body.Root;
    const payload = {
      ID: +root.ID[0],
      Amount: +root.Amount[0],
      Currency: root.Currency[0],
      CustomerEmail: root.CustomerEmail[0],
      SplitInfo: root.SplitInfo.map((split) => {
        return {
          SplitType: split.SplitType[0],
          SplitValue: +split.SplitValue[0],
          SplitEntityId: split.SplitEntityId[0],
        };
      }),
    };
    req.validatedBody = payload;
    next();
  } else {
    celebrate({
      body: Joi.object({
        ID: Joi.number().required(),
        Amount: Joi.number().positive().required(),
        Currency: Joi.string().required(),
        CustomerEmail: Joi.string().email().required(),
        SplitInfo: Joi.array()
          .min(1)
          .items(
            Joi.object().keys({
              SplitType: Joi.valid("FLAT", "RATIO", "PERCENTAGE").required(),
              SplitValue: Joi.number().positive().required(),
              SplitEntityId: Joi.string().required(),
            })
          )
          .min(1)
          .max(20)
          .required(),
      }),
    })(req, res, next);
  }
};
