const OfflineUser = require("../models/OfflineUser")
exports.createUser = async (req, res) => {
    // const offlineUser = new OfflineUser(req.body);
    const {
      fullName,
      email,
      phone,
      isStudent,
      isLocation,
      
    } = req.body;
    // if (referralCode) {
    //   const referrer = await OfflineUser.findOne({ referralCode: referralCode });
  
    //   if (referrer) {
    //     // Step 3: Increment referralFormSubmitted count for the referrer
    //     referrer.referrelFormSubmitted += 1;
    //     await referrer.save(); // Save the updated referrer details
    //   }
    // }
  
    try {
      const offlineUser = new OfflineUser({
        fullName,
        email,
        phone,
        isStudent,
        isLocation
       
      });
      console.log(offlineUser)
      await offlineUser.save();
      
      res.status(201).json({ message: "form data saved successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}