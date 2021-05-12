const Redis = require("ioredis");

const redisClient = new Redis({
  host: process.env.REDIS_ENDPOINT,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

exports.handler = async ({ body, httpMethod, queryStringParameters }) => {
  if (httpMethod === "POST") return createPost(body);

  if (httpMethod === "DELETE") return removePost(queryStringParameters?.id);

  return listPosts(queryStringParameters?.hashtag);
};

async function createPost(text) {
  const id = await redisClient.incr("post:id");
  const postKey = `post:${id}`;

  {
    const transaction = redisClient.multi();

    transaction.set(postKey, text);
    transaction.sadd("posts", postKey);

    extractHashtags(text).forEach((hashtag) =>
      transaction.sadd(`hashtag:${hashtag}`, postKey)
    );

    await transaction.exec();
  }

  return createResponse(201, { post: { id: postKey, text } });
}

async function listPosts(hashtag) {
  const setKey = hashtag ? `hashtag:${hashtag}` : "posts";

  const postKeys = await redisClient.smembers(setKey);

  let posts = await redisClient.mget(postKeys);

  posts = posts.map((text, i) => ({ id: postKeys[i], text }));

  return createResponse(200, { posts });
}

async function removePost(postKey) {
  const text = await redisClient.get(postKey);

  {
    const transaction = redisClient.multi();

    transaction.srem("posts", postKey);

    extractHashtags(text).forEach((hashtag) =>
      transaction.srem(`hashtag:${hashtag}`, postKey)
    );

    transaction.del(postKey);

    await transaction.exec();
  }

  return createResponse(200, { post: { id: postKey, text } });
}

const extractHashtags = (text) =>
  text.match(/#\w*/gm).map((hashtag) => hashtag.substr(1));

const createResponse = (statusCode, object) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(object),
});
