"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const events_1 = require("events");
const send_email_1 = require("../email/send.email");
const verfiy_email_template_1 = require("../email/verfiy.email.template");
exports.emailEvent = new events_1.EventEmitter();
exports.emailEvent.on("confirmEmil", async (data) => {
    try {
        data.subject = send_email_1.emailSubject.confirmEmail,
            data.html = (0, verfiy_email_template_1.template)(data.otp, data.username, data.subject);
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.log("Fial to send email", error);
    }
});
