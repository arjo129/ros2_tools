#include "third_party/httplib.h"
#include "third_party/json.hpp"
#include <gz/transport.hh>

using json = nlohmann::json;

int main(int argc, const char** argv) {
    httplib::Server svr;
    gz::transport::Node node;

    svr.Get("/topics", [&](const httplib::Request &, httplib::Response &res) {
        std::vector<std::string> topics;
        node.TopicList(topics);
        json j;
        j["topics"] = json::array();
        for (const auto &topic: topics) {
            json topicInfo;
            std::vector<gz::transport::MessagePublisher> publishers;
            node.TopicInfo(topic, publishers);
            topicInfo["topic"] = topic;
            if (publishers.size() > 0)
                topicInfo["type"] = publishers[0].MsgTypeName();
            else 
                topicInfo["type"] = "";
            j["topics"].push_back(topicInfo);
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.listen("127.0.0.1", 1234);

    return 0;
}
