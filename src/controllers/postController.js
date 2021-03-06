const mongoose = require('mongoose');
const Post = mongoose.model('Post');

exports.add = (req, res) => {
    res.render('postAdd');
};

exports.addAction = async (req, res) => {
    const { title, body, tags, photo } = req.body;
    const { _id: author } = req.user;
    const post = new Post({
        title,
        body,
        tags: tags.split(',').map(item => item.trim()),
        photo,
        author,
    });

    try {
        await post.save();
    } catch (error) {
        req.flash('error', `Erro: ${error.message}`);
        return res.redirect('/post/add');
    }

    req.flash('success', 'Post salvo com sucesso');

    return res.redirect('/');
};

exports.edit = async (req, res) => {
    const { slug } = req.params;
    const post = await Post.findOne({ slug });

    res.render('postEdit', { post });
};

exports.editAction = async (req, res) => {
    const { title, body, tags, photo } = req.body;
    const { slug } = req.params;
    try {
        await Post.findOneAndUpdate(
            { slug },
            {
                title,
                body,
                slug: require('slug')(title, { lower: true }),
                tags: tags.split(',').map(item => item.trim()),
                photo,
            },
            {
                new: true, // return the new updated post
                runValidators: true,
            }
        );
    } catch (error) {
        req.flash('error', `Erro: ${error.message}`);
        return res.redirect(`/post/${slug}/edit`);
    }

    req.flash('success', 'Post atualizado com sucesso');

    return res.redirect('/');
};

exports.view = async (req, res) => {
    const { slug } = req.params;
    const post = await Post.findOne({ slug });
    res.render('postView', { post });
};
