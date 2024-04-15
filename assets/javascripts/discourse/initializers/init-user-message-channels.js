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
      });
    }
  }
};
