const express = require("express");
var ObjectId = require("mongoose").Types.ObjectId;

const router = express.Router();
const Event = require("../models/event.js");
const User = require("../models/user.js");

const checkAuth = require("./utils");

/* GET Event listing. */
router.get("/", async (req, res, next) => {
    try {
        await Event.find({})
            .select("_id name location description image date owner")
            .populate("owner", "fullName image")
            .exec((err, event) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send(err);
                }
                return res.status(200).send(event);
            });
    } catch (e) {
        console.log(e);
        return res.status(400).send(e);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        await Event.findById(req.params.id)
            .populate("owner", "-password -events -createdAt -updatedAt")
            .exec((err, event) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send(err);
                }
                return res.status(200).send(event);
            });
    } catch (e) {
        console.log(e);
        return res.status(400).send(e);
    }
});

router.patch("/:id/add-volunteer", checkAuth, async (req, res, next) => {
    try {
        await Event.findById(req.params.id, async (err, event) => {
            if (err) {
                console.log(err);
                return res.status(400).send(err);
            }
            const { volunteerId } = req.body;
            const { volunteers } = event,
                volunteerIndex = volunteers.indexOf(volunteerId);
            if (volunteerIndex === -1) {
                volunteers.push(volunteerId);
            }
            // update user event objects
            User.findById(volunteerId, async (error, user) => {
                if (error) {
                    console.log(error);
                    return res.status(400).send(error);
                }
                const { interest } = user,
                    interestIndex = interest.indexOf(req.params.id);
                console.log(interestIndex);
                if (interestIndex === -1) {
                    interest.push(req.params.id);
                }
                await user.save();
            });
            await event.save();
            return res.sendStatus(200);
        });
    } catch (e) {
        console.log(e);
        return res.status(400).send(e);
    }
});

router.patch("/:id/remove-volunteer", checkAuth, async (req, res, next) => {
    try {
        await Event.findById(req.params.id, async (err, event) => {
            if (err) {
                console.log(err);
                return res.status(400).send(err);
            }

            const { volunteerId } = req.body;
            const { volunteers } = event,
                index = volunteers.indexOf(volunteerId);
            if (index > -1) {
                volunteers.splice(index, 1);
            }
            // update user event objects
            User.findById(volunteerId, async (error, user) => {
                if (error) {
                    console.log(error);
                    return res.status(400).send(error);
                }
                const { interest } = user,
                    interestIndex = interest.indexOf(req.params.id);
                if (interestIndex > -1) {
                    interest.splice(interestIndex, 1);
                }
                await user.save();
            });
            await event.save();
            return res.sendStatus(200);
        });
    } catch (e) {
        console.log(e);
        return res.status(400).send(e);
    }
});

router.patch("/:id", checkAuth, async (req, res, next) => {
    try {
        await Event.findById(req.params.id, async (err, event) => {
            if (err) {
                console.log(err);
                return res.status(400).send(err);
            }
            const keys = Object.keys(req.body);
            for (let key in args) {
                if (args.hasOwnProperty(key)) {
                    (event[key] = req), body[key];
                }
            }
            await event.save();
            return res.sendStatus(200);
        });
    } catch (e) {
        console.log(e);
        return res.status(400).send(e);
    }
});

router.get("/user/:id", checkAuth, async (req, res, next) => {
    const id = req.params.id;
    try {
        await Event.find({ owner: new ObjectId(id) })
            .populate({
                path: "volunteers",
                select: "-password -events -createdAt -updatedAt -interest"
            })
            .exec((err, result) => {
                console.log(err);
                res.send(result);
            });
    } catch (error) {
        console.log(error);
        return res.send(error);
    }
});

router.post("/", checkAuth, async (req, res, next) => {
    try {
        const {
            owner,
            name,
            location,
            description,
            image,
            requirements,
            date,
            time
        } = req.body;

        const event = await Event.create({
            owner,
            name,
            location,
            description,
            image,
            requirements,
            date,
            time
        });

        User.findById(owner).exec((err, user) => {
            if (err) {
                return res.send(err);
            }
            user.events.push(event._id);
            user.save((err, newUser) => console.log(err, newUser));
        });
        return res.status(200).send(event);
    } catch (e) {
        console.error(e);
        return res.status(404).send(e);
    }
});

module.exports = router;