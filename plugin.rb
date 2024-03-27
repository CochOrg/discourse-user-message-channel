# name: user-message-channel
# about: Adds user message channel
# version: 0.0.1
# authors: Awesome Plugin Developer
# url: https://github.com/CochOrg/discourse-reviewable-plugin

register_asset "stylesheets/notifications-styles.scss"

after_initialize do
  module ::UserMessageChannel
    PLUGIN_NAME = "user-message-channel"

    class Engine < ::Rails::Engine
      isolate_namespace UserMessageChannel
    end
  end

  %w[
      app/controllers/user-message-channel/user_messages_controller.rb
    ].each { |path| require_relative path }

  UserMessageChannel::Engine.routes.draw do
    post "/:user_id" => "user_messages#send_message_bus_message",
            :constraints => { user_id: /\d+/ }
  end

  Discourse::Application.routes.append do
    mount ::UserMessageChannel::Engine, at: "/send-message-bus-message"
  end
end
