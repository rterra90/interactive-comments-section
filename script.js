class Comment {
  constructor(id, img, nickname, date, content, rating, replies) {
    this.id = id;
    this.img = img;
    this.nickname = nickname;
    this.date = date;
    this.content = content;
    this.rating = rating;
    this.replies = replies;
  }
  element(type, parent_id) {
    //create comment element
    let new_comment_element = document.createElement('div');
    if (type == 'reply_1') {
      new_comment_element.classList.add('comment-box', 'first-reply');
      new_comment_element.dataset.parentId = parent_id;
    } else {
      new_comment_element.classList.add('main-comment-wrapper');
    }
    new_comment_element.dataset.id = this.id;
    let inner_comment;
    if (type == 'main') {
      inner_comment = document.createElement('div');
      inner_comment.classList.add('comment-box');
      inner_comment.id = this.id;
      new_comment_element.appendChild(inner_comment);
    }
    //create rating section
    let rating_section = document.createElement('div');
    rating_section.classList.add('rating');
    rating_section.dataset.id = this.id;
    type == 'reply_1' && rating_section.classList.add('is-reply');
    rating_section.innerHTML =
      '<div onclick=handleRating() role="button" data-rating="+">+</div><div class="current-rating">' +
      this.rating +
      '</div><div onclick=handleRating() role="button" data-rating="-">-</div>';

    //create main content section
    let main_content_section = document.createElement('div');
    main_content_section.classList.add('main-content');
    main_content_section.innerHTML =
      '<div class="comment-header"><img src=" ' +
      this.img +
      ' " alt=""><span class="nickname">' +
      this.nickname +
      '</span><span class="date">' +
      this.date +
      '</span><span class="reply-btn" role="button">Reply</span></div><div class="comment-content">' +
      this.content +
      '</div>';

    //inserts a class='inner' wrapper div to use flexbox
    if (type == 'main') {
      inner_comment.appendChild(document.createElement('div'));
      inner_comment.querySelector('div').classList.add('inner');
    } else if (type == 'reply_1') {
      new_comment_element.appendChild(document.createElement('div'));
      new_comment_element.querySelector('div').classList.add('inner');
    }

    //appends flex child rating section
    new_comment_element.querySelector('div.inner').appendChild(rating_section);

    //appends flex child main content section
    new_comment_element
      .querySelector('div.inner')
      .appendChild(main_content_section);

    //appends the comment component
    //if its a main comment, appends to main comments section wrapper
    //else if its a reply, appends to its reference comment wrapper
    if (type == 'main') {
      document
        .querySelector('#comments-section-wrapper')
        .appendChild(new_comment_element);
    } else if (type == 'reply_1') {
      document
        .querySelector(
          `.main-comment-wrapper[data-id="${new_comment_element.dataset.parentId}"]`,
        )
        .appendChild(new_comment_element);
    }
  }
}

let commentsObj;
if (localStorage.commentsObj) {
  commentsObj = JSON.parse(localStorage.commentsObj);
  renderElements(commentsObj);
} else {
  fetch('/data.json')
    .then((response) => response.json())
    .then((commentsJSON) => {
      commentsObj = commentsJSON;
      renderElements(commentsObj);
    });
}

function renderElements(obj) {
  obj.comments.forEach((comment) => {
    let comm = new Comment(
      comment.id,
      comment.user.image.png,
      comment.user.username,
      comment.createdAt,
      comment.content,
      comment.score,
      comment.replies.length,
    );
    comm.element('main');

    //check if the comment has replies to render
    if (comment.replies.length > 0) {
      let parent_id = comment.id;
      comment.replies.forEach((r) => {
        let reply = new Comment(
          r.id,
          r.user.image.png,
          r.user.username,
          r.createdAt,
          r.content,
          r.score,
        );
        reply.element('reply_1', parent_id);
      });
    }
  });
}

function handleRating() {
  switch (event.target.dataset.rating) {
    case '+':
      if (event.target.parentElement.classList.contains('is-reply')) {
        let parent_id =
          event.target.parentElement.parentElement.parentElement.dataset
            .parentId;
        let cmm_id = event.target.parentElement.dataset.id;

        commentsObj.comments.forEach((mainComment) => {
          if (mainComment.id == parent_id) {
            mainComment.replies.forEach((r) => {
              if (r.id == cmm_id) r.score += 1;
            });
          }
        });
        event.target.parentElement.querySelector('.current-rating').innerText =
          +event.target.parentElement.querySelector('.current-rating')
            .innerText + 1;
      } else {
        commentsObj.comments[
          +event.target.parentElement.dataset.id - 1
        ].score += 1;
      }
      break;
    case '-':
      if (event.target.parentElement.classList.contains('is-reply')) {
        let parent_id =
          event.target.parentElement.parentElement.parentElement.dataset
            .parentId;
        let cmm_id = event.target.parentElement.dataset.id;

        commentsObj.comments.forEach((mainComment) => {
          if (mainComment.id == parent_id) {
            mainComment.replies.forEach((r) => {
              if (r.id == cmm_id) r.score -= 1;
            });
          }
        });
        event.target.parentElement.querySelector('.current-rating').innerText =
          +event.target.parentElement.querySelector('.current-rating')
            .innerText - 1;
      } else {
        commentsObj.comments[
          +event.target.parentElement.dataset.id - 1
        ].score -= 1;
      }

      break;
  }
  function updateScore() {}

  localStorage.setItem('commentsObj', JSON.stringify(commentsObj));

  if (!event.target.parentElement.classList.contains('is-reply')) {
    event.target.parentElement.querySelector('.current-rating').innerText =
      commentsObj.comments[+event.target.parentElement.dataset.id - 1].score;
  }
}
