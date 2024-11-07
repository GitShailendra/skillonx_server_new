const OnlineUser = require("../models/OnlineUser")
const Resume = require("../models/Resume");
exports.increaseReferrel = async (req,res)=>{
    const { referralCode } = req.body;

    try {
      // Find the user who owns this referral code
      const user = await OnlineUser.findOne({ referralCode });
  
      if (!user) {
        return res.status(404).json({ message: "Referral code not found" });
      }
  
      // Increment the referral count by 1
      user.referralCount += 1;
  
      // Save the updated user
      await user.save();
  
      res.json({
        message: "Referral count incremented",
        referralCount: user.referralCount,
      });
    } catch (error) {
      console.error("Error incrementing referral count:", error);
      res.status(500).json({ message: "Error incrementing referral count" });
    }
}
exports.createUser =  async (req, res) => {
  // const onlineUser = new OnlineUser(req.body);
  const {
    fullName,
    email,
    phone,
    isStudent,
    isLocation,
    referralCode,
  } = req.body;
  
  if (referralCode) {
    const referrer = await OnlineUser.findOne({ referralCode: referralCode });

    if (referrer) {
      // Step 3: Increment referralFormSubmitted count for the referrer
      referrer.referrelFormSubmitted += 1;
      await referrer.save(); // Save the updated referrer details
    }
  }
  try {
    const onlineUser = new OnlineUser({
      fullName,
      email,
      phone,
      isStudent,
      isLocation
    });
    console.log(onlineUser);
    await onlineUser.save();
//     userMail(
//       email,
//       "Thank You for Your Interest in SkillonX",
//       `Thank you for showing interest in SkillonX. We're excited to have you here!
// Our website is currently under development, but we'll update you as soon as it goes live. In the meantime, we invite you to follow us on our social media channels to stay connected:
// LinkedIn: https://www.linkedin.com/company/skillonx/
// Facebook: https://www.facebook.com/profile.php?id=61566923306085
// Instagram: https://www.instagram.com/skillonx/
// We look forward to sharing more with you soon.
// Best regards,
// Bibin Antony K
// Product Head @ https://skillonx.com/`
//     );
    res.status(201).json({ message: "form data saved successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

exports.uploadResume = async (req, res) => {
  const { linkedinUrl, instagramUrl } = req.body;
  
  try {
    // Convert resume file to base64 and save it
    const resumeFilePath = req.file.buffer.toString("base64");

    const newResume = new Resume({
      resumeFilePath,
      linkedinUrl,
      instagramUrl,
    });
    
    await newResume.save();
    
    res.status(200).json({ message: "Resume uploaded successfully" });
  } catch (error) {
    console.error("Error uploading resume:", error);
    res.status(500).json({ message: "Failed to upload resume" });
  }
};

exports.saveReferrel = async (req,res)=>{
  const { email, referralCode } = req.body;

  try {
    // Find the user by email
    const user = await OnlineUser.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's referral code
    user.referralCode = referralCode;
    await user.save();

    res.status(200).json({ message: "Referral code saved successfully", user });
  } catch (error) {
    console.error("Error saving referral code:", error);
    res.status(500).json({ message: "Server error" });
  }
}
