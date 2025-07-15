# What we want to achive
now we improve the break page to better reflect the user's current task and session status.

# How to achive this

12. clear the breaktimeleft from break.js so it will be only one state for the time countdown.
13. make the break time in the break page from the background.js
14. change the break page to show the task i worked on in the last session.
15. ask me if i finished the task or not.
16. if i finished - mark the task as done and show the next task below ("next session you will work on: [next task name]").
17. if not finished - open new part that ask if i want to continue working on this task or to move to the next task.
18. if continue - keep the task as current and show the next session will be on this task.
19. if move on - mark the task as done and show the next task below ("next session you will work on: [next task name]").

# Some extra data you will use
```
those was the latest changes we implement in the tasks:
1. Create new button that open new options: 'task manager'.
2. when press, open input place to put the sheet name in the spreadsheet and load button.
3. when press make loading indicater.
4. meanwhile go the spreadsheet, the sheet name, and get from there the tasks list from table with 2 headers: task, description.
5. save all the tasks to the extension.
6. The user can see all the task in tasks.html (below). with button in the task manager.
---
7. every task has status - or before start, or current (in progress, always only one in this state) or done.
8. every working session (25 min) has his own task.
9. log also the task name to the logs sheet.
10. show the current task name in the popup.
11. when hover on the title show the task description (from the tasks table).

```

# REMEBER - FOLLOW EXACTLY THE MANDATORY WORKFLOW!
### Don't forget to update the readme.md with the new changes.

# Claude section where you write your MANDATORY WORKFLOW outputs: