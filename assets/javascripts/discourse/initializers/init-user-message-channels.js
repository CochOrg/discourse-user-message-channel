import {ajax} from "discourse/lib/ajax";
import {withPluginApi} from "discourse/lib/plugin-api";
import {cook} from "discourse/lib/text";
import NewReviewableModal from "../components/new-reviewable-modal";
import PushNotifications from "../lib/notifications";

export default {
  name: 'init-user-message-channels',
  after: "message-bus",

  initialize(container) {
    let notifications = new PushNotifications()
    let messageBusService = container.lookup("service:message-bus");
    withPluginApi("0.12.1", (api) => {
      api.onPageChange((url, title) => {
        let topicController = container.lookup("controller:topic");
        let topic = topicController.get('model');
        if (topic) {
          notifications.removeNotificationsByLink(`/t/${topic.get('slug')}/${topic.get('id')}`)
        }
      });
    });

    let userControllerService = container.lookup("controller:user");
    if (userControllerService?.currentUser?.id) {
      messageBusService.subscribe(`/user-messages/${userControllerService.currentUser.id}`, async (data) => {

        if (data?.type === 'modal') {
          let modalService = container.lookup("service:modal");
          let cookedText = await cook(data.text);
          modalService.show(NewReviewableModal, {model: {title: data.title, text: cookedText}});
        }

        if (data?.type === 'pushNotification') {
          notifications.insertNotificationItem(data.text, data.title)
        }

        // if (data.action === 'show_new_reviewable_modal') {
        //   const response = await ajax(`/updated-reviewable/${data.reviewable_id}`)
        //   if (response?.reviewable_queued_post?.payload?.raw) {
        //     let cookedText = await cook(response.reviewable_queued_post.payload.raw);
        //
        //     const temp = document.createElement('div')
        //     temp.insertAdjacentHTML('afterbegin', cookedText)
        //     const bElements = temp.querySelectorAll('b')
        //     const lastBText  = bElements[bElements.length - 1] ?? ''
        //
        //     let modalService = container.lookup("service:modal");
        //     modalService.show(NewReviewableModal, {model: {text: lastBText}});
        //   }
        // }
        //
        // if (data.action === 'show_reviewable_published_message') {
        //   const topic = await ajax(`/t/${data.topic_id}.json`)
        //   if (!topic?.title){
        //     return
        //   }
        //
        //   const post = await ajax(`/posts/${data.post_id}.json`)
        //   if (!post?.raw){
        //     return
        //   }
        //
        //   const title = 'Ваш пост опубликован'
        //   const topicName = topic.title
        //   const postText = notifications.cutText(post.raw)
        //   const link = data.post_url
        //   const text = `Ваше сообщение "${postText}" опубликовано в топике <a class="notification-item__link" href="${link}">"${topicName}"</a>`
        //
        //   notifications.insertNotificationItem(text, title)
        // }

        // if (data.action === 'show_new_private_message') {
        //   alert(11111111111111)
        // const post = await ajax(`/posts/${data.post_id}.json`)
        // if (!post?.raw){
        //   return
        // }
        //
        // const title = 'Новое сообщение от AI-ассистента или медиатора'
        // const postText = notifications.cutText(post.raw)
        // const link = data.post_url
        // const text = `${postText} <br><br> <a class="notification-item__link" href="${link}">Перейти в диалог</a>`
        //
        // notifications.insertNotificationItem(text, title)
        // }
      });
    }
  }
};
