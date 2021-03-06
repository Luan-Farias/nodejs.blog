exports.isLogged = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash(
            'error',
            'Ops! você não tem permissão para acessar esta página'
        );
        return res.redirect('/users/login');
    }

    return next();
};

exports.changePassword = (req, res) => {
    const { password, password_confirm } = req.body;

    if (password !== password_confirm) {
        req.flash('error', 'Senhas não batem');
        return res.redirect('/profile');
    }

    req.user.setPassword(password, async () => {
        await req.user.save();

        req.flash('success', 'Senha alterada com sucesso');
        return res.redirect('/');
    });
};
