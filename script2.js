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
  createCommentBox(context_id) {
    if (this.replies != undefined) {
      /*Create a main comment context*/
      let new_comment_context = document.createElement('div');
      new_comment_context.classList.add('comment-context');
      new_comment_context.dataset.context = this.id;
      /*Create a default box and a inner wrapper*/
      new_comment_context.innerHTML = `<div class="default-box" data-comment="main"><div class="inner-comment-box" data-comment-id=${this.id}></div></div>`;

      document
        .querySelector('#comments-section-wrapper')
        .appendChild(new_comment_context);
    } else {
      let new_reply_box = document.createElement('div');
      new_reply_box.classList.add('default-box');
      // new_reply_box.dataset.contextId = this.id;
      new_reply_box.dataset.comment = 'reply';
      new_reply_box.innerHTML = `<div class='inner-comment-box' data-context='${context_id}' data-comment-id=${this.id}></div>`;
      document
        .querySelector(`.comment-context[data-context='${context_id}']`)
        .appendChild(new_reply_box);
    }

    /*Create a rating buttons element as a inner wrapper flex child*/
    let rating_section = document.createElement('div');
    rating_section.classList.add('rating');
    rating_section.dataset.id = this.id;
    rating_section.innerHTML =
      '<div onclick=Comment.updateScore() role="button" data-rating="+">+</div><div class="current-rating">' +
      this.rating +
      '</div><div onclick=Comment.updateScore() role="button" data-rating="-">-</div>';

    document
      .querySelector(`.inner-comment-box[data-comment-id='${this.id}']`)
      .appendChild(rating_section);

    /*Create a main content element as a inner wrapper flex child*/
    let main_content_section = document.createElement('div');
    main_content_section.classList.add('main-content');
    main_content_section.innerHTML =
      '<div class="comment-header" data-id=' +
      this.id +
      '><img src=" ' +
      this.img +
      ' " alt=""><span class="nickname">' +
      this.nickname +
      '</span><span class="date">' +
      this.date +
      '</span><span data-active=false class="reply-btn" role="button" onclick=Comment.addReply(' +
      this.id +
      ')><img src="./images/icon-reply.svg">Reply</span></div><div class="comment-content">' +
      this.content +
      '</div>';
    document
      .querySelector(`.inner-comment-box[data-comment-id='${this.id}']`)
      .appendChild(main_content_section);
  }
  createReplyComposerBox() {}
  static updateScore() {
    let rating_id = event.target.parentElement.dataset.id;
    if (
      !event.target.parentElement.parentElement.hasAttribute('data-context')
    ) {
      commentsObj.comments[+rating_id - 1].score +=
        event.target.dataset.rating == '+' ? 1 : -1;

      /* Update score */
      event.target.parentElement.querySelector('.current-rating').innerText =
        commentsObj.comments[+event.target.parentElement.dataset.id - 1].score;
    } else {
      let _context = event.target.parentElement.parentElement.dataset.context;
      commentsObj.comments.forEach((mainComment) => {
        if (mainComment.id == _context) {
          mainComment.replies.forEach((r) => {
            if (r.id == rating_id) {
              r.score += event.target.dataset.rating == '+' ? 1 : -1;
              /* Update score */
              event.target.parentElement.querySelector(
                '.current-rating',
              ).innerText = r.score;
            }
          });
        }
      });
    }
    localStorage.setItem('commentsObj', JSON.stringify(commentsObj));
  }
}

//
//create a global comments object from JSON or from localStorage
let commentsObj;
if (localStorage.commentsObj) {
  commentsObj = JSON.parse(localStorage.commentsObj);
  renderElements(commentsObj);
} else {
  fetch('./data.json')
    .then((response) => response.json())
    .then((commentsJSON) => {
      commentsObj = commentsJSON;
      renderElements(commentsObj);
    });
}
//END create a global comments object from JSON or from localStorage
//

//
//function that renders comments elements from Comment class
function renderElements(obj) {
  obj.comments.forEach((comment) => {
    let new_comment = new Comment(
      comment.id,
      comment.user.image.png,
      comment.user.username,
      comment.createdAt,
      comment.content,
      comment.score,
      comment.replies.length,
    );
    new_comment.createCommentBox();

    //check if the comment has replies to render
    if (comment.replies.length > 0) {
      let context_id = comment.id;
      comment.replies.forEach((r) => {
        let reply = new Comment(
          r.id,
          r.user.image.png,
          r.user.username,
          r.createdAt,
          r.content,
          r.score,
        );
        reply.createCommentBox(context_id);
      });
    }
  });
}
//END function that renders comments elements from Comment class
//
