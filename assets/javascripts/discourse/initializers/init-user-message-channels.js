import {withPluginApi} from "discourse/lib/plugin-api";
import {cook} from "discourse/lib/text";
import NewReviewableModal from "../components/new-reviewable-modal";
import PushNotifications from "../lib/notifications";


const getLocalizedText = (locales) => {
  if (!locales){
    return null;
  }

  locales = JSON.parse(locales);
  const acceptedLocales = ['ru', 'uk'];
  const currentLocale = document.querySelector('html')?.lang || 'en';

  if (!acceptedLocales.includes(currentLocale)){
    return locales.en;
  }

  return locales[currentLocale];
};

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

        let title = getLocalizedText(data.title);
        let text = getLocalizedText(data.text);

        if (data?.type === 'modal') {
          let modalService = container.lookup("service:modal");
          let cookedText = await cook(text);
          modalService.show(NewReviewableModal, {model: {title, text: cookedText}});
        }

        if (data?.type === 'pushNotification') {
          notifications.insertNotificationItem(text, title);
        }
      });
    }
  }
};
