require "erb"

# Call like this:
#
#   ruby add_collection.rb <moonrank_id> <magiceden_id> <solanart_id>
#

collection_name = {
  moonrank: ARGV[0],
  magiceden: ARGV[1] || ARGV[0],
  solanart: ARGV[2] || ARGV[0]
}

# Create the workflow file based on the template
workflow_template_filename = File.join(File.dirname(__FILE__), "./templates/workflow.yml.erb")
workflow_template = ERB.new(File.read(workflow_template_filename))

workflow_filename = File.join(File.dirname(__FILE__), "./.github/workflows/#{collection_name[:moonrank]}.yml")
File.open(workflow_filename, "w") do |workflow|
  workflow.write(workflow_template.result)
end

# Process moonrank data
require_relative "moonrank/process_moonrank_data"
