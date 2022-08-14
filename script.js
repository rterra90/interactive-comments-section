class Comment {
  constructor(id, user, date, content, score, replies) {
    this.id = id;
    this.user = user;
    this.createdAt = date;
    this.content = content;
    this.score = score;
    this.replies = replies;
  }
  createCommentBox(context_id) {
    if (this.replies != undefined) {
      let new_comment_context = document.createElement('div');
      new_comment_context.classList.add('comment-context');
      new_comment_context.dataset.context = this.id;

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
      this.score +
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
      this.user.image.png +
      ' " alt=""><span class="nickname">' +
      this.user.username +
      '</span><span class="date">' +
      this.createdAt +
      '</span><span data-active=false class="reply-btn" role="button" onclick=Comment.createReplyComposerBox(' +
      this.id +
      ')><img src="./images/icon-reply.svg">Reply</span></div><div class="comment-content">' +
      this.content +
      '</div>';
    document
      .querySelector(`.inner-comment-box[data-comment-id='${this.id}']`)
      .appendChild(main_content_section);
  }
  static createReplyComposerBox(comment_id) {
    if (event.target.dataset.active == 'false') {
      let target_comment = document.querySelector(
        `.inner-comment-box[data-comment-id="${comment_id}"]`,
      );
      // target_comment.hasAttribute('data-context') && console.log('reply');

      let reply_composer_box = document.createElement('div');
      reply_composer_box.classList.add(
        'default-box',
        'reply-composer',
        'comment-composer',
      );
      reply_composer_box.dataset.repliedComment = comment_id;
      let reply_context = target_comment.hasAttribute('data-context')
        ? target_comment.dataset.context
        : comment_id;
      reply_composer_box.innerHTML = `<div class='inner-reply'><div class='avatar'><img src=${commentsObj.currentUser.image.png}></div><div class='reply-input'><textarea name='reply-input' rows='4'></textarea></div><div class='reply-send-btn'><button onclick=Comment.submitReply(${reply_context}) data-replying-to=${comment_id}>Send</button></div></div>`;

      reply_composer_box.style.width =
        target_comment.parentElement.offsetWidth - 30 + 'px';

      target_comment.parentElement.parentElement.insertBefore(
        reply_composer_box,
        target_comment.parentElement.nextElementSibling,
      );

      event.target.dataset.active = true;
    } else {
      document.querySelector(
        `.comment-composer[data-replied-comment='${comment_id}']`,
      ).style.animationName = 'elementOut';
      setTimeout(() => {
        document
          .querySelector(
            `.comment-composer[data-replied-comment='${comment_id}']`,
          )
          .remove();
      }, 300);

      event.target.dataset.active = false;
    }
  }
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
  static submitReply(reply_context) {
    let context_main_comment = document.querySelector(
      `.inner-comment-box[data-comment-id='${reply_context}']`,
    );
    let ref_comment = document.querySelector(
      `[data-comment-id='${event.target.dataset.replyingTo}']`,
    );
    let comment_content;
    if (ref_comment.hasAttribute('data-context')) {
      comment_content =
        '<b>@' +
        ref_comment.querySelector('.nickname').innerText +
        '</b> ' +
        event.target.parentElement.parentElement.querySelector('textarea')
          .value;
    } else {
      comment_content =
        event.target.parentElement.parentElement.querySelector(
          'textarea',
        ).value;
    }

    // let comment_content = `${
    //   '@user' +
    //   event.target.parentElement.parentElement.querySelector('textarea').value
    // } `;

    let comment_createdAt = () => {
      // let now = new Date();
      // return now.getTime();
      return 'today';
    };

    let submmited_comment_object = {
      id: (idCounter += 1),
      content: comment_content,
      createdAt: comment_createdAt(),
      score: 0,
      replyingTo: context_main_comment.querySelector('.nickname').innerText,
      user: commentsObj.currentUser,
    };
    let new_reply = new Comment(
      submmited_comment_object.id,
      submmited_comment_object.user,
      submmited_comment_object.createdAt,
      submmited_comment_object.content,
      submmited_comment_object.score,
    );

    new_reply.createCommentBox(reply_context);

    commentsObj.comments.forEach((mainComment) => {
      if (mainComment.id == reply_context) {
        mainComment.replies.push(new_reply);
      }
    });
    localStorage.setItem('commentsObj', JSON.stringify(commentsObj));

    event.target.parentElement.parentElement.parentElement.remove();

    document.querySelector(
      `.inner-comment-box[data-comment-id='${event.target.dataset.replyingTo}'] .reply-btn`,
    ).dataset.active = false;
  }
}

//
//create a global comments object from JSON or from localStorage
let idCounter = 0;
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
    idCounter += 1;
    let new_comment = new Comment(
      comment.id,
      comment.user,
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
        idCounter += 1;
        let reply = new Comment(r.id, r.user, r.createdAt, r.content, r.score);
        reply.createCommentBox(context_id);
      });
    }
  });
}
//END function that renders comments elements from Comment class
//
