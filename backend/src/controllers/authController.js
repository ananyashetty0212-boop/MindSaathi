const Caregiver = require('../models/Caregiver');
const ElderlyProfile = require('../models/ElderlyProfile');
const Reminder = require('../models/Reminder');

const mockStore = require('../services/mockDataStore');
const { getDBStatus } = require('../config/db');

const {
  hashPassword,
  verifyPassword,
  signToken,
  generatePin
} = require('../services/authService');

function cleanCaregiver(caregiver) {
  return {
    id: String(caregiver._id || caregiver.id),
    fullName: caregiver.fullName,
    email: caregiver.email,
    phone: caregiver.phone,
    relationship: caregiver.relationship
  };
}

function cleanElder(elder) {
  return {
    id: String(elder._id || elder.id),
    name: elder.name,
    age: elder.age,
    preferredLanguage: elder.preferredLanguage || 'English',
    region: elder.region || '',
    emergencyContactName: elder.emergencyContactName || '',
    emergencyContactPhone: elder.emergencyContactPhone || '',
    wakeTime: elder.wakeTime || '07:00 AM',
    sleepTime: elder.sleepTime || '09:30 PM',
    waterGoal: elder.waterGoal || 8,
    caregiverId: String(elder.caregiverId)
  };
}

function validateCaregiverRegistration(body) {
  const required = [
    'caregiverName',
    'email',
    'phone',
    'password',
    'relationship',
    'elderName',
    'elderAge'
  ];

  return required.filter(
    (key) =>
      body[key] === undefined ||
      body[key] === null ||
      String(body[key]).trim() === ''
  );
}


/* ============================================================
   CAREGIVER REGISTER + ELDER PROFILE CREATION
   ============================================================ */

exports.registerCaregiver = async (req, res) => {
  try {
    const body = req.body || {};

    const missing = validateCaregiverRegistration(body);

    if (missing.length) {
      return res.status(400).json({
        success: false,
        error: `Please fill: ${missing.join(', ')}`
      });
    }

    if (String(body.password).length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters.'
      });
    }

    const age = Number(body.elderAge);

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid elderly age.'
      });
    }

    const email = String(body.email).trim().toLowerCase();

    const caregiverData = {
      fullName: String(body.caregiverName).trim(),
      email,
      phone: String(body.phone).trim(),
      passwordHash: hashPassword(String(body.password)),
      relationship: String(body.relationship).trim()
    };

    const pin = generatePin();

    const elderData = {
      name: String(body.elderName).trim(),
      age,
      preferredLanguage: String(
        body.preferredLanguage || 'English'
      ).trim(),

      // Region is optional and is NOT used for branding.
      region: String(body.region || '').trim(),

      emergencyContactName: String(
        body.emergencyContactName || ''
      ).trim(),

      emergencyContactPhone: String(
        body.emergencyContactPhone || ''
      ).trim(),

      wakeTime: String(
        body.wakeTime || '07:00 AM'
      ).trim(),

      sleepTime: String(
        body.sleepTime || '09:30 PM'
      ).trim(),

      waterGoal: Number(body.waterGoal || 8),

      accessPin: pin
    };

    const dbStatus = getDBStatus();


    /* ========================================================
       MONGODB MODE
       ======================================================== */

    if (dbStatus.connected) {
      const existing = await Caregiver.findOne({ email }).lean();

      if (existing) {
        return res.status(409).json({
          success: false,
          error:
            'A caregiver account with this email already exists.'
        });
      }

      const caregiver = await Caregiver.create(caregiverData);

      const elder = await ElderlyProfile.create({
        ...elderData,
        caregiverId: caregiver._id
      });


      // Initial routine for a newly created elder.
      await Reminder.insertMany([
        {
          patientId: String(elder._id),
          title: 'Morning Medicine',
          category: 'medicine',
          dosageOrInstruction:
            'Confirm after taking your scheduled medicine.',
          scheduledTime: '08:30 AM',
          timeOfDay: 'Morning',
          status: 'pending',
          repeatDaily: true
        },
        {
          patientId: String(elder._id),
          title: 'Drink Water',
          category: 'hydration',
          dosageOrInstruction:
            'Drink one full glass of water.',
          scheduledTime: '11:00 AM',
          timeOfDay: 'Morning',
          status: 'pending',
          repeatDaily: true
        },
        {
          patientId: String(elder._id),
          title: 'Gentle Activity',
          category: 'activity',
          dosageOrInstruction:
            'Take a gentle walk or complete a calm daily activity.',
          scheduledTime: '05:30 PM',
          timeOfDay: 'Evening',
          status: 'pending',
          repeatDaily: true
        }
      ]);

      const token = signToken({
        id: String(caregiver._id),
        role: 'caregiver',
        patientId: String(elder._id)
      });

      return res.status(201).json({
        success: true,
        message:
          'Caregiver account and elderly profile created successfully.',
        token,
        role: 'caregiver',

        caregiver: cleanCaregiver(caregiver),

        elder: {
          ...cleanElder(elder),
          accessPin: pin
        },

        pinNotice:
          'Give this 4-digit PIN to the elderly user. Keep it private.'
      });
    }


    /* ========================================================
       IN-MEMORY DEMO MODE
       ======================================================== */

    const result =
      mockStore.createCaregiverWithElder(
        caregiverData,
        elderData
      );

    if (result.error === 'EMAIL_EXISTS') {
      return res.status(409).json({
        success: false,
        error:
          'A caregiver account with this email already exists.'
      });
    }

    const token = signToken({
      id: result.caregiver.id,
      role: 'caregiver',
      patientId: result.elder.id
    });

    return res.status(201).json({
      success: true,
      message:
        'Account created in local demo mode.',
      token,
      role: 'caregiver',

      caregiver: cleanCaregiver(result.caregiver),

      elder: {
        ...cleanElder(result.elder),
        accessPin: pin
      },

      pinNotice:
        'Give this 4-digit PIN to the elderly user. Local demo data resets when the backend restarts.'
    });

  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({
      success: false,
      error:
        'Could not create account: ' + error.message
    });
  }
};


/* ============================================================
   CAREGIVER LOGIN
   ============================================================ */

exports.loginCaregiver = async (req, res) => {
  try {
    const email = String(
      req.body?.email || ''
    ).trim().toLowerCase();

    const password = String(
      req.body?.password || ''
    );

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const dbStatus = getDBStatus();

    let caregiver = null;
    let elders = [];


    if (dbStatus.connected) {
      caregiver = await Caregiver.findOne({
        email
      });

      if (
        !caregiver ||
        !verifyPassword(
          password,
          caregiver.passwordHash
        )
      ) {
        return res.status(401).json({
          success: false,
          error:
            'Incorrect email or password.'
        });
      }

      elders = await ElderlyProfile.find({
        caregiverId: caregiver._id
      }).lean();

    } else {
      caregiver =
        mockStore.findCaregiverByEmail(email);

      if (
        !caregiver ||
        !verifyPassword(
          password,
          caregiver.passwordHash
        )
      ) {
        return res.status(401).json({
          success: false,
          error:
            'Incorrect email or password.'
        });
      }

      elders =
        mockStore.getEldersForCaregiver(
          caregiver.id
        );
    }

    const firstElder = elders[0];

    const token = signToken({
      id: String(
        caregiver._id || caregiver.id
      ),
      role: 'caregiver',
      patientId: firstElder
        ? String(firstElder._id || firstElder.id)
        : null
    });

    return res.json({
      success: true,
      token,
      role: 'caregiver',

      caregiver:
        cleanCaregiver(caregiver),

      elders:
        elders.map(cleanElder)
    });

  } catch (error) {
    console.error(
      'Caregiver login error:',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        'Caregiver login failed: ' +
        error.message
    });
  }
};


/* ============================================================
   ELDER LOGIN USING 4-DIGIT PIN
   ============================================================ */

exports.loginElder = async (req, res) => {
  try {
    const pin = String(
      req.body?.pin || ''
    ).trim();

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error:
          'Please enter the 4-digit PIN provided by your caregiver.'
      });
    }

    const dbStatus = getDBStatus();

    let elder = null;
    let caregiver = null;


    if (dbStatus.connected) {
      elder =
        await ElderlyProfile.findOne({
          accessPin: pin
        });

      if (!elder) {
        return res.status(401).json({
          success: false,
          error:
            'That PIN was not found. Please check with your caregiver.'
        });
      }

      caregiver =
        await Caregiver.findById(
          elder.caregiverId
        ).lean();

    } else {
      elder =
        mockStore.findElderByPin(pin);

      if (!elder) {
        return res.status(401).json({
          success: false,
          error:
            'That PIN was not found. Please check with your caregiver.'
        });
      }

      caregiver =
        mockStore.findCaregiverById(
          elder.caregiverId
        );
    }


    const token = signToken({
      id: String(
        elder._id || elder.id
      ),
      role: 'elderly',
      caregiverId: String(
        elder.caregiverId
      ),
      patientId: String(
        elder._id || elder.id
      )
    });


    return res.json({
      success: true,
      token,
      role: 'elderly',

      elder: cleanElder(elder),

      caregiver: caregiver
        ? cleanCaregiver(caregiver)
        : null
    });

  } catch (error) {
    console.error(
      'Elder login error:',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        'Elder login failed: ' +
        error.message
    });
  }
};


/* ============================================================
   CURRENT USER PROFILE
   ============================================================ */

exports.getMyProfile = async (req, res) => {
  try {
    const dbStatus = getDBStatus();

    if (req.user.role === 'caregiver') {
      let caregiver;
      let elders;

      if (dbStatus.connected) {
        caregiver =
          await Caregiver.findById(
            req.user.id
          ).lean();

        elders =
          await ElderlyProfile.find({
            caregiverId: req.user.id
          }).lean();

      } else {
        caregiver =
          mockStore.findCaregiverById(
            req.user.id
          );

        elders =
          mockStore.getEldersForCaregiver(
            req.user.id
          );
      }

      if (!caregiver) {
        return res.status(404).json({
          success: false,
          error:
            'Caregiver profile not found.'
        });
      }

      return res.json({
        success: true,
        role: 'caregiver',

        caregiver:
          cleanCaregiver(caregiver),

        elders:
          elders.map(cleanElder)
      });
    }


    let elder;
    let caregiver;

    if (dbStatus.connected) {
      elder =
        await ElderlyProfile.findById(
          req.user.id
        ).lean();

      caregiver = elder
        ? await Caregiver.findById(
            elder.caregiverId
          ).lean()
        : null;

    } else {
      elder =
        mockStore.findElderById(
          req.user.id
        );

      caregiver = elder
        ? mockStore.findCaregiverById(
            elder.caregiverId
          )
        : null;
    }

    if (!elder) {
      return res.status(404).json({
        success: false,
        error:
          'Elderly profile not found.'
      });
    }

    return res.json({
      success: true,
      role: 'elderly',

      elder:
        cleanElder(elder),

      caregiver: caregiver
        ? cleanCaregiver(caregiver)
        : null
    });

  } catch (error) {
    console.error(
      'Profile error:',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        'Could not load profile: ' +
        error.message
    });
  }
};