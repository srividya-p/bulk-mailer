const url = require('url');

var express = require('express');

const User = require('./models/user')
const Group = require('./models/groups')
const Campaign = require('./models/campaign')
const Setting = require('./models/settings')
const Smtp = require('./models/smtp')
const { sendEmailAndUpdate } = require('./mailer/email')

var router = express.Router();


// Display Dashboard
router.get('/', async (req, res) => {
    try {
        let set = await Setting.find()
        res.locals = { title: 'Dashboard' };
        res.render('Dashboard/dashboard', { mails: set[0].mail_count });
    } catch (e) {
        res.status(400).send(e)
    }
})

// Display Users
router.get('/users', async (req, res) => {
    try {
        let users = await User.find();
        res.locals = { title: 'Users' };
        res.render('Users/users', { users: users });
    } catch (e) {
        res.status(400).send(e)
    }
})

// Add User
router.get('/add', (req, res) => {
    res.locals = { title: 'Users' };
    res.render('Users/add');
})

router.post('/added', async (req, res) => {

    const user = new User(req.body);
    try {
        //populating the User table
        let currentGroups = await Group.find();
        if (currentGroups.length == 0) {
            await user.save();
        } else {
            let isExisting = await User.find({ email: req.body.email, group: req.body.group });
            if (isExisting.length == 0) {
                await user.save();
            } else {
                throw new Error('Entered user is already present in the Group!')
            }
        }
        console.log('Inserted!')

        //populating the Groups table
        let unique = true;
        if (currentGroups.length != 0) {
            currentGroups.forEach((group) => {
                if (group.name == req.body.group) unique = false
            })
            if (unique) {
                const group = new Group({ name: req.body.group, u_no: 1 });
                await group.save();
            } else {
                await Group.findOneAndUpdate({ name: req.body.group }, {
                    $inc: { 'u_no': 1 }
                });
            }
        } else {
            const group = new Group({ name: req.body.group, u_no: 1 });
            await group.save();
        }

        res.locals = { title: 'Users' };
        res.redirect('/add');

    } catch (e) {
        res.status(400).send('<script>alert(\''+e.message+'\'); window.history.back();</script>')
    }
})

// Delete User

router.get('/users/delete', async (req, res) => {
    const urlObj = url.parse(req.originalUrl, true)
    try {
        await User.deleteOne({ _id: urlObj.query.id });
        await Group.findOneAndUpdate({ name: urlObj.query.group }, {
            $inc: { 'u_no': -1 }
        });
        let currentGroups = await Group.find();
        currentGroups.forEach(async (group) => {
            if (group.u_no == 0) {
                await Group.deleteOne({ name: group.name });
            }
        })
        res.locals = { title: 'Users' };
        res.redirect('/users');
    } catch (e) {
        res.status(400).send(e)
    }
})

// Update User

router.get('/update', async (req, res) => {
    const urlObj = url.parse(req.originalUrl, true)
    try {
        let user = await User.find({ _id: urlObj.query.id });
        res.locals = { title: 'Users' };
        res.render('Users/update', { user: user })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/updated', async (req, res) => {
    const urlObj = url.parse(req.originalUrl, true)
    try {
        await User.findOneAndUpdate({ _id: urlObj.query.id }, {
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address,
            country: req.body.country
        });
        res.redirect('/users')
    } catch (e) {
        res.status(400).send(e)
    }
})

// View User

router.get('/view', async (req, res) => {
    const urlObj = url.parse(req.originalUrl, true)
    try {
        let user = await User.find({ _id: urlObj.query.id });
        res.locals = { title: 'Users' };
        res.render('Users/view', { user: user })
    } catch (e) {
        res.status(400).send(e)
    }
})

//User Groups
router.get('/user-group', async (req, res) => {
    try {
        let groups = await Group.find()
        res.locals = { title: 'User Groups' };
        res.render('UserGroup/user_group', { groups: groups });
    } catch {
        res.status(400).send(e)
    }
})

//Campaign
router.get('/all', async (req, res) => {
    try {
        let campaigns = await Campaign.find()
        res.locals = { title: 'All Campaigns' };
        res.render('Campaign/all', { campaign: campaigns });
    } catch (e) {
        res.status(400).send(e)
    }
})

// Add New Campaign

router.get('/new', async (req, res) => {
    try {
        let groups = await Group.find()
        let settings = await Setting.find()
        let emails = await Smtp.find()
        res.locals = { title: 'New Campaign' };
        res.render('Campaign/new', { groups: groups, settings: settings, emails: emails });
    } catch (e) {
        res.status(400).send(e)
    }
})

// Send Email

router.post('/send', async (req, res) => {
    sendEmailAndUpdate(req.body)
    res.redirect('/all')
})


//Settings
router.get('/settings', async (req, res) => {
    try {
        let current = await Setting.find()
        if (current.length == 0) {
            let setting = new Setting({ default_email: 'None' })
            await setting.save();
        }
        current = await Setting.find()

        let smtp = await Smtp.find()
        res.locals = { title: 'Settings' };
        res.render('Settings/settings', { setting: current, smtp: smtp });

    } catch (e) {
        res.status(400).send(e)
    }
})

// Add Email

router.get('/add-email', (req, res) => {
    res.locals = { title: 'Emails' };
    res.render('Settings/add');
})

router.post('/email-added', async (req, res) => {
    const smtp = new Smtp(req.body)
    try {
        await smtp.save()
        res.redirect('/settings')
    } catch (e) {
        res.status(400).send('<script>alert(\'Entered Email Already Exists!\'); window.history.back();</script>')
    }
})

// Delete Email

router.get('/delete-email', async (req, res) => {
    const urlObj = url.parse(req.originalUrl, true)
    try {
        await Smtp.deleteOne({ _id: urlObj.query.id });
        res.locals = { title: 'Emails' };
        res.redirect('/settings');
    } catch (e) {
        res.status(400).send(e)
    }
})

// Update Email

router.get('/update-email', async (req, res) => {
    const urlObj = url.parse(req.originalUrl, true)
    try {
        let smtp = await Smtp.find({ _id: urlObj.query.id });
        res.locals = { title: 'Emails' };
        res.render('Settings/update', { smtp: smtp })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/email-updated', async (req, res) => {
    const urlObj = url.parse(req.originalUrl, true)
    try {
        await Smtp.findOneAndUpdate({ _id: urlObj.query.id }, req.body);
        res.redirect('/settings')
    } catch (e) {
        res.status(400).send(e)
    }
})

// Set Default Email

router.post('/set', async (req, res) => {
    try {
        let current = await Setting.find()
        await Setting.findOneAndUpdate({ _id: current[0]._id }, { default_email: req.body.email })
        res.redirect('/settings')
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router;