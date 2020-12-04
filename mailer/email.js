const nodemailer = require('nodemailer')

const User = require('../models/user')
const Group = require('../models/groups')
const Campaign = require('../models/campaign')
const Setting = require('../models/settings')
const Smtp = require('../models/smtp')

const sendEmailAndUpdate = async (details) => {
    let userList = []
    if (Array.isArray(details.checkbox)) {
        for (let i = 0; i < details.checkbox.length; i++) {
            let groupList = await User.find({ group: details.checkbox[i] })
            userList = userList.concat(groupList)
        }
    } else {
        userList = await User.find({ group: details.checkbox })
    }

    let to = ''
    for (let i = 0; i < userList.length; i++) {
        to += userList[i].email + ', '
    }
    to = to.replace(/,\s*$/, "");

    let from = await Smtp.find({ email: details.from_email })

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: from[0].email,
            pass: from[0].password
        },
        pool: true, // use pooled connection
        rateLimit: true, // enable to make sure we are limiting
        maxConnections: 1, // set limit to 1 connection only
        maxMessages: 10, // send 3 emails per second
    });

    var mailOptions = {
        from: from[0].email,
        to: to,
        subject: details.subject,
        html: details.message
    };

    transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
            let campaign = new Campaign({ name: details.name, status: 'Error' })
            await campaign.save()

            console.log(error.message);
        } else {
            let campaign = new Campaign({ name: details.name, status: 'Sent' })
            await campaign.save()

            let current = await Setting.find()
            await Setting.findOneAndUpdate({ _id: current[0]._id }, { $inc: { mail_count: userList.length } })

            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    sendEmailAndUpdate
}