require "erb"
require "json"

# Generates the Alpha Art axios config files based on the collections in collections.json

collection_index_filename = File.join(File.dirname(__FILE__), "../.github/collections.json")
collections = JSON.parse File.open(collection_index_filename).read

# Fetch template
template_filename = File.join(File.dirname(__FILE__), "../templates/alpha_art_axios_config.json.erb")
template = ERB.new(File.read(template_filename))

# Generate each config file based on the template
collections.each do |collection|
  collection.transform_keys!(&:to_sym)
  next unless collection[:alpha_art]

  config = template.result_with_hash(collection: collection)

  # Save the config file
  config_filename = File.join(File.dirname(__FILE__), "../.github/alpha_axios_configs/#{collection[:moonrank]}.json")
  File.open(config_filename, "w") do |config_file|
    config_file.write(config)
  end
end
