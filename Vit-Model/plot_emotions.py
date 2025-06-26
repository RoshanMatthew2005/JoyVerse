import matplotlib.pyplot as plt           # Import matplotlib for plotting graphs
from pymongo import MongoClient           # Import MongoClient to connect to MongoDB
import pandas as pd                       # Import pandas for data manipulation

# Connect to MongoDB database
client = MongoClient("mongodb://localhost:27017/")   # Create a MongoDB client connected to localhost
db = client["emotion_db"]                            # Access the 'emotion_db' database
collection = db["emotion_predictions"]               # Access the 'emotion_predictions' collection

# Fetch all records from the collection
records = list(collection.find({}))                  # Retrieve all documents from the collection as a list
if not records:                                      # Check if the list is empty
    print("⚠️ No data found in DB.")                 # Print a warning if no data is found
    exit()                                           # Exit the script

# Convert the records to a pandas DataFrame for easier processing
df = pd.DataFrame(records)                           # Convert the list of records to a DataFrame
df["timestamp"] = pd.to_datetime(df["timestamp"])    # Convert the 'timestamp' column to datetime objects

# Line plot: Plot confidence scores for each emotion over time
plt.figure(figsize=(10, 5))                          # Create a new figure with specified size
for emotion in df["emotion"].unique():               # Loop through each unique emotion in the DataFrame
    subset = df[df["emotion"] == emotion]            # Filter rows for the current emotion
    plt.plot(subset["timestamp"],                    # Plot timestamps on the x-axis
             subset["confidence"],                   # Plot confidence scores on the y-axis
             marker='o',                             # Use circle markers for data points
             label=emotion)                          # Label the line with the emotion

plt.xlabel("Timestamp")                              # Set the x-axis label
plt.ylabel("Confidence")                             # Set the y-axis label
plt.title("Emotion Confidence Over Time")            # Set the plot title
plt.legend()                                         # Show the legend
plt.grid(True)                                       # Enable the grid
plt.savefig("emotion_trend_db.png")                  # Save the plot as an image file
print("📈 Saved emotion_trend_db.png")               # Print a message indicating the file was saved
plt.show()                                           # Display the plot

# Pie chart: Show the distribution of emotions in the dataset
emotion_counts = df["emotion"].value_counts()        # Count occurrences of each emotion
plt.figure(figsize=(6, 6))                           # Create a new figure for the pie chart
plt.pie(emotion_counts,                              # Data for the pie chart
        labels=emotion_counts.index,                 # Labels for each slice
        autopct='%1.1f%%',                           # Show percentages on the chart
        startangle=140)                              # Start angle for the first slice
plt.title("Overall Emotion Distribution")            # Set the pie chart title
plt.savefig("emotion_distribution_db.png")           # Save the pie chart as an image file
print("🥧 Saved emotion_distribution_db.png")         # Print a message indicating the file was saved
plt.show()                                           # Display the pie chart
