---
name: booking-com-automation
description: Automate hotel booking on booking.com — from search to payment handoff. Use when user wants to search, book, or compare hotels on booking.com. Uses OpenClaw browser tool with A11Y tree for reliable element identification. Speak Chinese or English depending on user preference.
---

# Booking.com Automation

完成酒店预订全流程自动化：搜索 → 选房 → 填写信息 → 交接至支付页面。

## When to Use

**USE when user asks to:**
- 搜索并预订酒店 (search and book hotels)
- 按日期/目的地查找住宿 (find accommodation by date/destination)
- 比较酒店价格和选项 (compare hotel prices and options)
- 完成酒店预订直至支付页面 (complete hotel booking to payment page)

**DON'T use for:** 机票、租车、餐厅预订

---

## ⚠️ 必须按顺序执行

Booking.com 强制要求按以下顺序完成预订：

```
1. search    → 填写搜索表单，提交搜索
2. results   → 提取并展示搜索结果
3. property  → 选择酒店，进入详情页
4. room      → 提取房间选项
5. selection → 选择房型
6. guest     → 填写住客信息
7. payment   → 进入支付页面，交接给用户
```

---

## Browser 工具使用模式

**所有操作使用 `browser` 工具**，步骤：

1. 执行 `browser snapshot --interactive` 获取当前页面 A11Y 树
2. 从快照中找到目标元素的 ref（如 `e7`）
3. 使用 `browser click e7` 或 `browser type e7 "text"` 操作
4. 页面变化后**必须重新 snapshot**

**Ref 是动态的**：每次 snapshot 后 ref 会变化，不要硬编码 ref 值。

---

## Stage 1: Search（搜索）

### 操作步骤

1. **打开 booking.com**
   ```
   browser navigate https://www.booking.com
   ```

2. **获取快照，找到搜索表单元素**
   ```
   browser snapshot --interactive
   ```
   找到：
   - 目的地输入框：`combobox "Where are you going?"`
   - 日期按钮：`button "Check-in date..."`
   - 人数按钮：`button "Number of travelers..."`
   - 搜索按钮：`button "Search"`

3. **输入目的地**
   ```
   browser click <目的地输入框ref>
   browser type <目的地输入框ref> "Paris"
   ```

4. **设置日期**
   ```
   browser click <日期按钮ref>
   ```
   在日期选择器中：
   - 找到并点击入住日期
   - 找到并点击离店日期
   - 点击确认按钮

5. **设置人数**
   ```
   browser click <人数按钮ref>
   ```
   在弹窗中：
   - 点击 adults + 或 - 调整人数
   - 点击 rooms + 或 - 调整房间数
   - 点击确认

6. **提交搜索**
   ```
   browser click <搜索按钮ref>
   ```

7. **等待搜索结果加载**
   ```
   browser wait --url "**/searchresults**"
   ```
   验证到达搜索结果页。

---

## Stage 2: Results（提取结果）

### 从快照提取酒店列表

执行 `browser snapshot --interactive`，在搜索结果页提取：

```
酒店名称: link "Hotel Name" (在结果卡片中)
评分: text "Scored 8.5"
价格: text "HK$ 1,234"
位置: text "10th arr., Paris"
```

### 向用户展示结果

将结果格式化为列表，让用户选择：

```
酒店列表：
1. Hotel A - HK$500/晚 - 评分8.5 - 位置: 10区
2. Hotel B - HK$800/晚 - 评分9.0 - 位置: 8区
3. Hotel C - HK$600/晚 - 评分8.2 - 位置: 12区

请选择酒店（输入序号）：
```

---

## Stage 3: Property（选择酒店）

### 操作步骤

1. **从结果中找到目标酒店**
   ```
   browser snapshot --interactive
   ```
   找到酒店名称对应的 link ref

2. **点击酒店卡片**
   ```
   browser click <酒店link ref>
   ```

3. **等待详情页加载**
   ```
   browser wait --url "**/hotel/**"
   ```

---

## Stage 4: Room（提取房间）

### 操作步骤

1. **在详情页获取快照**
   ```
   browser snapshot --interactive
   ```

2. **找到房间选项区域**
   - 滚动页面找到房间列表
   - 每个房间显示：房型、价格、取消政策

3. **提取房间信息**
   ```
   房间列表：
   - Room A: HK$500/晚, 免费取消
   - Room B: HK$700/晚, 含早餐
   - Room C: HK$600/晚, 不可取消
   ```

4. **向用户展示房间选项**
   等待用户选择房型

---

## Stage 5: Selection（选择房型）

### 操作步骤

1. **找到用户选择的房间**
   ```
   browser snapshot --interactive
   ```
   找到对应房间的 "Select" 或 "Reserve" 按钮

2. **点击选择**
   ```
   browser click <Select按钮ref>
   ```

3. **处理弹窗（如有）**
   - 检查是否需要登录
   - 处理 cookie banner
   ```
   browser click <接受cookie按钮ref>  # 如有
   ```

4. **等待预订表单**
   ```
   browser wait --url "**/booking/**"
   ```

---

## Stage 6: Guest（填写住客信息）

### 操作步骤

1. **获取表单快照**
   ```
   browser snapshot --interactive
   ```

2. **找到并填写表单字段**
   - First name: textbox with label "First name"
   - Last name: textbox with label "Last name"  
   - Email: textbox with label "Email address"
   - Phone: textbox with label "Phone number"

3. **填写示例**
   ```
   browser type <firstname ref> "John"
   browser type <lastname ref> "Smith"
   browser type <email ref> "john@example.com"
   browser type <phone ref> "+1234567890"
   ```

4. **滚动页面，查找并点击 "Next" 或 "Continue"**
   ```
   browser click <下一步按钮ref>
   ```

---

## Stage 7: Payment（支付交接）

### 操作步骤

1. **验证到达支付页面**
   ```
   browser snapshot --interactive
   ```

2. **检查页面内容**
   - 显示完整的预订摘要
   - 显示最终价格
   - 显示 "Pay Now" 或类似按钮

3. **向用户展示结果**
   ```
   预订摘要：
   - 酒店: Hotel A
   - 入住: 2026-04-01
   - 离店: 2026-04-05
   - 总价: HK$ 2,000
   - 状态: 请在支付页面完成付款

   请手动完成支付。
   ```

4. **交接给用户手动支付**
   Agent 不完成支付操作，交由用户自行完成。

---

## 常见问题处理

### Cookie Banner
```
browser snapshot --interactive
browser click <"Accept" button ref>
```

### 弹窗遮挡
```
browser wait --timeout-ms 2000
browser click <弹窗关闭按钮ref>
```

### 页面加载慢
```
browser wait --timeout-ms 5000
browser wait --url "**/searchresults**"
```

### 需要登录
如果检测到登录墙：
```
向用户说明: "请先在浏览器中登录 booking.com，然后继续。"
Agent 暂停，等待用户确认完成登录。
```

---

## 交互点

| Stage | 需要用户输入 | 原因 |
|-------|-------------|------|
| 2. Results | ✅ 是 | 用户选择哪个酒店 |
| 4. Room | ✅ 是 | 用户选择哪个房间 |
| 6. Guest | ✅ 是 | 用户提供联系信息 |
| 其他 | ❌ 否 | 自动执行 |

**原则**: 需要用户输入时，Agent 必须暂停自动化，明确询问用户。

---

## 示例命令

- `"帮我预订巴黎4月1日至5日的酒店，2位成人"`
- `"Find hotels in Tokyo for April 10-15"`
- `"比较上海酒店价格，4月1日入住3晚"`
- `"Book a hotel in New York, 2 adults, check-in tomorrow"`

---

**Version:** 3.0.0
**Last Updated:** 2026-03-23
