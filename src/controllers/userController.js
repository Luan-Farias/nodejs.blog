const User = require('../models/User');
const crypto = require('crypto');
const mailHandler = require('../handlers/mailHandler');

exports.login = (req, res) => {
    res.render('login');
};

exports.loginAction = (req, res) => {
    const { email, password } = req.body;
    const auth = User.authenticate();

    auth(email, password, (error, result) => {
        if (!result) {
            req.flash('error', 'Seu e-mail e/ou senha estão errados');
            return res.redirect('/users/login');
        }

        req.login(result, () => {});

        req.flash('success', 'você foi logado com sucesso');
        return res.redirect('/');
    });
};

exports.register = (req, res) => {
    res.render('register');
};

exports.registerAction = (req, res) => {
    const { name, email, password } = req.body;
    const newUser = new User({
        name,
        email,
    });
    User.register(newUser, password, error => {
        if (error) {
            req.flash('error', 'ocorreu um erro, tente mais tarde');
            return res.redirect('/users/register');
        }

        req.flash('success', 'Registro efetuado com sucesso, faça o Login');
        return res.redirect('/users/login');
    });
};

exports.logout = (req, res) => {
    req.logout();
    return res.redirect('/');
};

exports.profile = (req, res) => {
    res.render('profile');
};

exports.profileAction = async (req, res) => {
    const { name, email } = req.body;

    try {
        await User.findOneAndUpdate(
            { _id: req.user._id },
            { name, email },
            { new: true, runValidators: true }
        );
        req.flash('success', 'Dados atualizados com sucesso!');
    } catch (e) {
        req.flash('error', 'Ocorreu algum erro: ' + e.message);
    }

    return res.redirect('/profile');
};

exports.forget = (req, res) => {
    res.render('forget');
};

exports.forgetAction = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).exec();
    if (!user) {
        req.flash('error', 'E-mail não cadastrado');
        return res.redirect('/users/forget');
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3_600_000; // actual date + 1 hour

    await user.save();

    const resetLink = `http://${req.headers.host}/users/reset/${user.resetPasswordToken}`;

    const html = `
        E-mail com link: <br />
        <a href="${resetLink}">Resetar sua senha</a>
    `;

    const text = `E-mail with link ${resetLink}`;

    const to = `${user.name} <${user.email}>`;

    mailHandler.send({
        to,
        subject: 'Resetar sua senha',
        html,
        text,
    });

    req.flash('success', `Te enviamos um e-mail com instruções`);
    return res.redirect('/users/login');
};

exports.forgetToken = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    }).exec();

    if (!user) {
        req.flash('error', 'Token expirado!');
        return res.redirect('/users/forget');
    }

    res.render('forgetPassword');
};

exports.forgetTokenAction = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    }).exec();

    if (!user) {
        req.flash('error', 'Token expirado!');
        return res.redirect('/users/forget');
    }

    const { password, password_confirm } = req.body;

    if (password !== password_confirm) {
        req.flash('error', 'Senhas não batem');
        return res.redirect('back');
    }

    user.setPassword(password, async () => {
        await user.save();

        req.flash('success', 'Senha alterada com sucesso');
        return res.redirect('/users/login');
    });
};
