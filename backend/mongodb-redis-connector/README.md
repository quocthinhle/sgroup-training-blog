# MongoDB redis connector


- For building user feeds, we have two approaches:
  - Posting a blog is simply insert to global collection of blogs.
  When a user requests their home timeline, look up all the people they follow, find all the tweets for each of those users, and merge them (sort by time). In a relational database, we could write a query such as:
    ```
    SELECT tweets.*, users.* FROM tweets
    JOIN users ON tweets.sender_id = users.id
    JOIN follows ON follows.followee_id = users.id
    WHERE follows.follower_id = current_user
    ```
      With this approach, READ is heavy, WRITE is cheap.



  - Maintain a cache for each user's home timeline - like a mailbox of tweets for each recipient user. When a user post a tweet, look up all the people who follow that user, and insert the new tweet into each of their home timeline caches. READ is cheap, WRITE is heavy.

- And since feeds is a READ heavy system, we should follow the second approach. But the problem with this approach is when user has too much follower, it could become a significant amount of write operation, for example if user has 30 million followers, it means a single blog may result over 30 million writes to home timelines!. So we should optimize them (for example separate them into another flow and mixed it with the current flow.)