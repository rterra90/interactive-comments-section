class Comment {
  constructor(id, img, nickname, date, content, score, replies) {
    this.id = id;
    this.img = img;
    this.nickname = nickname;
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
      this.img +
      ' " alt=""><span class="nickname">' +
      this.nickname +
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

      let reply_composer_box = document.createElement('div');
      reply_composer_box.classList.add(
        'default-box',
        'reply-composer',
        'comment-composer',
      );
      reply_composer_box.dataset.repliedComment = comment_id;
      reply_composer_box.innerHTML =
        "<div class='inner-reply'><div class='avatar'><img src=" +
        commentsObj.currentUser.image.png +
        "></div><div class='reply-input'><textarea name='reply-input' rows='4'></textarea></div><div class='reply-send-btn'><button onclick=Comment.submitReply(" +
        comment_id +
        ')>Send</button></div></div>';

      reply_composer_box.style.width =
        target_comment.parentElement.offsetWidth - 30 + 'px';

      target_comment.parentElement.parentElement.insertBefore(
        reply_composer_box,
        target_comment.parentElement.nextElementSibling,
      );

      event.target.dataset.active = true;
    } else {
      document
        .querySelector(
          `.comment-composer[data-replied-comment='${comment_id}']`,
        )
        .remove();
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
  static submitReply(reply_to) {
    let ref_comment = document.querySelector(
      `.inner-comment-box[data-comment-id='${reply_to}']`,
    );
    let comment_content =
      event.target.parentElement.parentElement.querySelector('textarea').value;
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
      replyingTo: ref_comment.querySelector('.nickname').innerText,
      user: commentsObj.currentUser,
    };
    let new_reply = new Comment(
      submmited_comment_object.id,
      submmited_comment_object.user.image.png,
      submmited_comment_object.user.username,
      submmited_comment_object.createdAt,
      submmited_comment_object.content,
      submmited_comment_object.score,
    );
    new_reply.createCommentBox(reply_to);

    commentsObj.comments.forEach((mainComment) => {
      if (mainComment.id == reply_to) {
        mainComment.replies.push(new_reply);
      }
    });
    console.log(commentsObj);
    localStorage.setItem('commentsObj', JSON.stringify(commentsObj));

    document
      .querySelector(`.comment-composer[data-replied-comment='${reply_to}']`)
      .remove();
    document.querySelector(
      `.inner-comment-box .reply-btn`,
    ).dataset.active = false;
    // console.log(new_reply);
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
        idCounter += 1;
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
