const mongoose = require('mongoose');
const Post = mongoose.model('Post');

exports.index = async (req, res) => {
    const responseJson = {
        pageTitle: 'Home',
        posts: [],
        tags: [],
        tag: '',
    };

    responseJson.tag = req.query.tag;
    const postFilter =
        typeof responseJson.tag !== 'undefined'
            ? { tags: responseJson.tag }
            : {};

    const tagsPromise = Post.getTagsList();
    const postsPromise = Post.findPosts(postFilter);

    const result = await Promise.all([tagsPromise, postsPromise]);

    const [tags, posts] = result;

    responseJson.tags = tags.map(tag =>
        tag._id == responseJson.tag ? { ...tag, class: 'selected' } : tag
    );

    if (req.isAuthenticated()) {
        posts.map((post, key) => {
            if (post.author._id.toString() === req.user.id)
                posts[key].canEdit = true;
        });
    }

    responseJson.posts = posts;

    return res.render('home', responseJson);
};
