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

      if (document.querySelector('#comments-section-wrapper .add-comment')) {
        // new_comment_context.childNodes[0].classList.add('anima-in')
        document
          .querySelector('#comments-section-wrapper')
          .insertBefore(
            new_comment_context,
            document.querySelector('#comments-section-wrapper .add-comment'),
          );
      } else {
        document
          .querySelector('#comments-section-wrapper')
          .appendChild(new_comment_context);
      }
      this.replies > 0 && new_comment_context.classList.add('has-replies');
    } else {
      let new_reply_box = document.createElement('div');
      new_reply_box.classList.add('default-box');
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
      '</span></div><div class="comment-content">' +
      this.content +
      '</div>';

    // create delete button
    if (this.user.username == commentsObj.currentUser.username) {
      let deleteSpan = document.createElement('span');
      deleteSpan.classList.add('delete-btn');
      deleteSpan.dataset.id = this.id;
      deleteSpan.innerHTML =
        '<div onclick=Comment.deleteComment(' +
        this.id +
        ') data-id=' +
        this.id +
        '><img src="./images/icon-delete.svg"><a>Delete</a></div>';

      main_content_section
        .querySelector('.comment-header')
        .appendChild(deleteSpan);

      let editSpan = document.createElement('span');
      editSpan.innerHTML =
        '<span data-active=false class="reply-btn" role="button" onclick=Comment.editComment(' +
        this.id +
        ')><img src="./images/icon-edit.svg">Edit</span>';
      main_content_section
        .querySelector('.comment-header')
        .appendChild(editSpan);
    } else {
      let replySpan = document.createElement('span');
      replySpan.classList.add('reply-btn-wrapper');
      replySpan.innerHTML =
        '<span data-active=false class="reply-btn" role="button" onclick=Comment.createReplyComposerBox(' +
        this.id +
        ')><img src="./images/icon-reply.svg">Reply</span>';
      main_content_section
        .querySelector('.comment-header')
        .appendChild(replySpan);
    }

    //create reply or edit button

    document
      .querySelector(`.inner-comment-box[data-comment-id='${this.id}']`)
      .appendChild(main_content_section);

    this.replies > 0 &&
      (document.querySelector(
        `.comment-context[data-context='${this.id}']`,
      ).dataset.height =
        document.querySelector(
          `.comment-context[data-context='${this.id}'] .default-box`,
        ).offsetHeight + 'px');
  }
  static addCommentBox() {
    let add_comment = document.createElement('div');
    add_comment.classList.add('default-box', 'comment-composer', 'add-comment');

    add_comment.innerHTML = `<div class='inner-reply'><div class='avatar'><img src=${commentsObj.currentUser.image.png}></div><div class='reply-input'><textarea name='reply-input' rows='4'></textarea></div><div class='reply-send-btn'><button onClick=Comment.submitNewComment() >Send</button></div></div>`;

    document
      .querySelector('#comments-section-wrapper')
      .appendChild(add_comment);
  }
  static submitNewComment() {
    let new_comment_obj = {
      id: (idCounter += 1),
      content:
        event.target.parentElement.parentElement.querySelector('textarea')
          .value,
      createdAt: 'today',
      score: 0,
      user: commentsObj.currentUser,
      replies: [],
    };
    let new_comment = new Comment(
      new_comment_obj.id,
      new_comment_obj.user,
      new_comment_obj.createdAt,
      new_comment_obj.content,
      new_comment_obj.score,
      new_comment_obj.replies,
    );
    new_comment.createCommentBox();

    //Find the comment in the global comments object and update content
    commentsObj.comments.push(new_comment_obj);
    localStorage.setItem('commentsObj', JSON.stringify(commentsObj));
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
      let reply_context = target_comment.hasAttribute('data-context')
        ? target_comment.dataset.context
        : comment_id;
      reply_composer_box.innerHTML = `<div class='inner-reply'><div class='avatar'><img src=${commentsObj.currentUser.image.png}></div><div class='reply-input'><textarea name='reply-input' rows='4'></textarea></div><div class='reply-send-btn'><button onclick=Comment.submitReply(${reply_context}) data-replying-to=${comment_id}>Reply</button></div></div>`;

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
      commentsObj.comments.forEach((comment) => {
        if (comment.id == rating_id) {
          comment.score += event.target.dataset.rating == '+' ? 1 : -1;

          /* Update score */
          event.target.parentElement.querySelector(
            '.current-rating',
          ).innerText = comment.score;
        }
      });
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
    let comment_content =
      '<b>@' +
      ref_comment.querySelector('.nickname').innerText +
      '</b> ' +
      event.target.parentElement.parentElement.querySelector('textarea').value;

    document
      .querySelector(`.comment-context[data-context='${reply_context}']`)
      .classList.add('has-replies');

    let submmited_comment_object = {
      id: (idCounter += 1),
      content: comment_content,
      createdAt: 'today',
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
  static deleteComment(target_id) {
    let delete_modal = document.createElement('div');
    delete_modal.classList.add('delete-modal');
    delete_modal.innerHTML = `<div class="delete-modal-alert"><span>Delete comment</span><p>Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p><div class="buttons"><button data-value="no">No, cancel</button><button data-value="yes">Yes, delete</button></div></div>`;
    document.querySelector('body').classList.add('modal-active');
    document.querySelector('body').appendChild(delete_modal);
    document.querySelectorAll('.delete-modal button').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (event.target.dataset.value == 'no') {
          document.querySelector('body').classList.remove('modal-active');
          document.querySelector('.delete-modal').remove();
        } else {
          let target_comment = document.querySelector(
            `.inner-comment-box[data-comment-id="${target_id}"]`,
          );
          if (target_comment.hasAttribute('data-context')) {
            target_comment.parentElement.classList.add('removing-comment');
            setTimeout(() => {
              target_comment.parentElement.remove();
            }, 900);
          } else {
            target_comment.parentElement.classList.add('removing-comment');
            setTimeout(() => {
              target_comment.parentElement.parentElement.remove();
            }, 900);
          }
          document.querySelector('body').classList.remove('modal-active');
          document.querySelector('.delete-modal').remove();

          commentsObj.comments.forEach((comment, i, this_array) => {
            if (comment.id == target_id) {
              this_array.splice(i, 1);
            } else if (comment.replies.length > 0) {
              comment.replies.forEach((reply, j, thisArray) => {
                if (reply.id == target_id) {
                  thisArray.splice(j, 1);
                }
              });
            }
          }),
            localStorage.setItem('commentsObj', JSON.stringify(commentsObj));
        }
      });
    });
  }
  static editComment(target_id) {
    let _targetElement = event.target.hasAttribute('data-active')
      ? event.target
      : event.target.parentElement;

    let target_comment = document.querySelector(
      `[data-comment-id='${target_id}']`,
    );

    if (_targetElement.dataset.active == 'false') {
      target_comment.querySelector('.comment-content').style.display = 'none';

      let edit_textarea = document.createElement('textarea');
      edit_textarea.classList.add('edit-input');
      edit_textarea.rows = 4;
      edit_textarea.value =
        target_comment.querySelector('.comment-content').innerText;

      target_comment.querySelector('.main-content').appendChild(edit_textarea);

      _targetElement.dataset.active = true;

      let edit_textarea_submit = document.createElement('button');
      edit_textarea_submit.innerText = 'Update';

      edit_textarea_submit.addEventListener('click', () => {
        let new_value = edit_textarea.value;
        target_comment.querySelector('.comment-content').innerText = new_value;
        target_comment.querySelector('.comment-content').style.display =
          'block';
        _targetElement.dataset.active = false;
        edit_textarea.remove();
        edit_textarea_submit.remove();

        //Find the comment in the global comments object and update content
        commentsObj.comments.forEach((comment) => {
          if (comment.id == target_id) {
            comment.content = new_value;
          } else if (comment.replies.length > 0) {
            comment.replies.forEach((reply) => {
              if (reply.id == target_id) {
                reply.content = new_value;
              }
            });
          }
        }),
          localStorage.setItem('commentsObj', JSON.stringify(commentsObj));
      });
      target_comment
        .querySelector('.main-content')
        .appendChild(edit_textarea_submit);
    } else {
      _targetElement.dataset.active = false;
      target_comment.querySelector('textarea').remove();
      target_comment.querySelector('button').remove();
      target_comment.querySelector('.comment-content').style.display = 'block';
    }
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
  let main_comments_scores = [];
  obj.comments.forEach((comment) => {
    main_comments_scores.push(comment.score);
  });
  main_comments_scores = main_comments_scores.sort(function (a, b) {
    return b - a;
  });
  let inserted_ids = [];
  main_comments_scores.forEach((score) => {
    obj.comments.forEach((comment) => {
      if (comment.score == score && !inserted_ids.includes(comment.id)) {
        comment.id > idCounter && (idCounter = comment.id);
        inserted_ids.push(comment.id);
        //create comment
        let new_comment = new Comment(
          comment.id,
          comment.user,
          comment.createdAt,
          comment.content,
          comment.score,
          comment.replies.length,
        );
        comment.inserted = true;

        new_comment.createCommentBox();

        //check if the comment has replies to render
        if (comment.replies.length > 0) {
          let context_id = comment.id;
          comment.replies.forEach((r) => {
            r.id > idCounter && (idCounter = r.id);
            idCounter += 1;
            let reply = new Comment(
              r.id,
              r.user,
              r.createdAt,
              r.content,
              r.score,
            );
            reply.createCommentBox(context_id);
          });
        }
        //create comment end
      }
    });
  });
  let add_comment_box = Comment.addCommentBox();
}

//END function that renders comments elements from Comment class
//
