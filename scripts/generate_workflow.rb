require "erb"
require "json"

# Generates the Github Actions workflow file based on the collections in collections.json

collection_index_filename = File.join(File.dirname(__FILE__), "../.github/collections.json")
collections = JSON.parse File.open(collection_index_filename).read

# Fetch all templates
main_workflow_filename = File.join(File.dirname(__FILE__), "../templates/main_workflow.yml.erb")
main_workflow = File.read(main_workflow_filename)

magic_eden_workflow_template_filename = File.join(File.dirname(__FILE__), "../templates/magic_eden_workflow.yml.erb")
magic_eden_workflow_template = ERB.new(File.read(magic_eden_workflow_template_filename))

solanart_workflow_template_filename = File.join(File.dirname(__FILE__), "../templates/solanart_workflow.yml.erb")
solanart_workflow_template = ERB.new(File.read(solanart_workflow_template_filename))

alpha_art_workflow_template_filename = File.join(File.dirname(__FILE__), "../templates/alpha_art_workflow.yml.erb")
alpha_art_workflow_template = ERB.new(File.read(alpha_art_workflow_template_filename))

exchange_art_workflow_template_filename = File.join(File.dirname(__FILE__), "../templates/exchange_art_workflow.yml.erb")
exchange_art_workflow_template = ERB.new(File.read(exchange_art_workflow_template_filename))

# Fill in the workflow contents based on the stored collections
collections.each do |collection|
  collection.transform_keys!(&:to_sym)
  main_workflow += magic_eden_workflow_template.result_with_hash(collection: collection) if collection[:magic_eden]
  main_workflow += solanart_workflow_template.result_with_hash(collection: collection) if collection[:solanart]
  main_workflow += alpha_art_workflow_template.result_with_hash(collection: collection) if collection[:alpha_art]
  main_workflow += exchange_art_workflow_template.result_with_hash(collection: collection) if collection[:exchange_art]
end

# Save the new workflow
workflow_filename = File.join(File.dirname(__FILE__), "../.github/workflows/flat.yml")
File.open(workflow_filename, "w") do |workflow|
  workflow.write(main_workflow)
end
