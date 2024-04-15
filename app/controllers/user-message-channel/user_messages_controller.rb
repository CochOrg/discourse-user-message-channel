# frozen_string_literal: true

module UserMessageChannel
  class UserMessagesController < ::ApplicationController
    requires_plugin UserMessageChannel::PLUGIN_NAME

    def send_message_bus_message

      user_message_data = {
        :type => params[:type],
        :title => nil,
        :text => nil,
      }

      if params.has_key?(:title)
        user_message_data[:title] = params[:title].to_json
      end
      if params.has_key?(:text)
        user_message_data[:text] = params[:text].to_json
      end

      begin
        MessageBus.publish("/user-messages/#{params[:user_id].to_i}", user_message_data)
      rescue Exception => e
        render json: { success: false, message: e.message }
      end

      render json: { success: true }
    end
  end
end
