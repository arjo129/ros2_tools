#include "third_party/httplib.h"
#include "third_party/json.hpp"
#include <gz/transport.hh>
#include "ament_index_cpp/get_package_share_directory.hpp"

using json = nlohmann::json;


std::filesystem::path get_resource_path()
{
    
    // Get the share directory for your package
    std::string package_share_directory = ament_index_cpp::get_package_share_directory("gz_introspection_agent");

    // Construct the path to your resource file
    // Assuming you installed files into share/your_package_name/resources
    std::filesystem::path resource_file_path = 
        std::filesystem::path(package_share_directory) / "resources" ;

    std::cout << "Attempting to access resource: " << resource_file_path << std::endl;

    // Check if the file exists and read it
    if (!std::filesystem::exists(resource_file_path)) {
      std::cerr << "Resource file not found at: " << resource_file_path << std::endl;
      exit(-1);
    }
    return resource_file_path;
}

int main(int argc, const char** argv) {
    httplib::Server svr;
    gz::transport::Node node;

    auto resource_path = get_resource_path();

    svr.Get("/topics", [&](const httplib::Request &, httplib::Response &res) {
        std::vector<std::string> topics;
        node.TopicList(topics);
        json j;
        j["topics"] = json::array();
        for (const auto &topic: topics) {
            json topicInfo;
            std::vector<gz::transport::MessagePublisher> publishers;
            std::vector<gz::transport::MessagePublisher> subscribers;
            node.TopicInfo(topic, publishers, subscribers);
            topicInfo["topic"] = topic;
            if (publishers.size() > 0)
                topicInfo["type"] = publishers[0].MsgTypeName();
            else 
                topicInfo["type"] = "";
            j["topics"].push_back(topicInfo);
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Get("/", [&](const httplib::Request &req, httplib::Response &res) {
  	auto file = resource_path / "index.html";	
        res.set_file_content(file.string());
    });

    svr.Get("/script.js", [&](const httplib::Request &req, httplib::Response &res) {
  	auto file = resource_path / "script.js";
        res.set_file_content(file.string());
    });


    svr.listen("127.0.0.1", 1234);

    return 0;
}
