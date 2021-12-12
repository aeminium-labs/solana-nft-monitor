require "yaml"
require "pry"
require "open-uri"
require "json"
require "net/http"

MARKETPLACE_FILTER_KEY = {
  magic_eden: "Magic Eden",
  solanart: "Solanart",
  alpha_art: "Alpha Art",
  exchange_art: "Exchange Art"
}

marketplace_filter = MARKETPLACE_FILTER_KEY[ARGV[0]&.to_sym]
collection_filter = ARGV[1]
puts "Applying #{marketplace_filter} filter!" if marketplace_filter
puts "Running only for #{collection_filter}!" if collection_filter

# This script tests the workflow and post processors by running them more or
# less like how GitHub Actions would. This allows us to quickly see the affect
# of changes to the postprocessors. You can pass in a marketplace and a
# collection filter as arguments to the script. For example, to only run Alpha
# Art requests:
#
#   ruby scripts/test_workflow.rb alpha_art
#
# And to run only for Arab Punkz:
#
#   ruby scripts/test_workflow.rb "" arabpunkz
#

workflow_filename = File.join(File.dirname(__FILE__), "../.github/workflows/flat.yml")
workflow = YAML.load_file(workflow_filename)

workflow_steps = workflow["jobs"]["scheduled"]["steps"].select { |step| step["uses"] == "githubocto/flat@v3" }

workflow_steps.each do |step|
  next if marketplace_filter && !step["name"].include?(marketplace_filter)
  next if collection_filter && !step["name"].include?(collection_filter)
  puts "Processing: #{step["name"]}"

  args = step["with"]
  marketplace_url = args["http_url"]
  downloaded_filename = args["downloaded_filename"]
  axios_config_filename = args["axios_config"]
  postprocess = args["postprocess"]

  # Do some quick workflow format validation

  raise "Missing http_url" unless marketplace_url
  raise "Missing downloaded_filename" unless downloaded_filename
  raise "Missing postprocess" unless postprocess

  # Download the data

  if axios_config_filename
    axios_config = JSON.parse File.open(File.join(File.dirname(__FILE__), "../#{axios_config_filename}")).read
    uri = URI.parse(marketplace_url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    response = http.post(uri.path, axios_config["data"].to_json)
    marketplace_data = JSON.parse response.body
  else
    marketplace_data = JSON.parse URI.open(marketplace_url).read
  end

  File.open(File.join(File.dirname(__FILE__), "../#{downloaded_filename}"), "w") do |downloaded_file|
    downloaded_file.write JSON.pretty_generate(marketplace_data)
  end

  # Postprocess the downloaded file

  system "deno run -q -A --unstable #{postprocess} #{downloaded_filename}"
end
