#!/usr/bin/env node

const axios = require('axios').default;

const [owner, repo] = process.env.BUILD_REPOSITORY_NAME.split('/');
const prId = process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER;
const botName = 'theguild-bot';
const url = `https://api.github.com/repos/${owner}/${repo}`;

const commentBody = (process.env.COMMENT_BODY || '').replace('{PR_NUMBER}', prId);

const headers = {
  Authorization: `Bearer ${process.env.GH_API_TOKEN}`,
};

async function findComment() {
  const { data } = await axios.get(`${url}/issues/${prId}/comments`, {
    responseType: 'json',
    headers,
  });
  const comments = data;

  if (comments && Array.isArray(comments)) {
    const found = comments.find(comment => comment.user.login === botName);

    return found.id;
  }
}

async function createComment() {
  await axios.patch(
    `${url}/issues/${prId}/${commentId}`,
    { body: commentBody },
    {
      responseType: 'json',
      headers,
    }
  );
}

async function updateComment(commentId) {
  await axios.patch(
    `${url}/issues/comments/${commentId}`,
    { body: commentBody },
    {
      responseType: 'json',
      headers,
    }
  );
}

async function main() {
  const existingId = await findComment();

  if (existingId) {
    await updateComment(existingId);
  } else {
    await createComment();
  }
}

main();
